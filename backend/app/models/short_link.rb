class ShortLink < ApplicationRecord
  MAX_CODE_RETRIES = 10

  belongs_to :user
  belongs_to :subdomain, optional: true
  has_many :clicks, dependent: :destroy

  validates :original_url, presence: true,
            length: { maximum: 2048 },
            format: { with: /\Ahttps?:\/\/.+/i, message: "must start with http:// or https://" }
  validates :short_code, presence: true, uniqueness: true, length: { minimum: 4, maximum: 20 },
            format: { with: /\A[a-zA-Z0-9]+\z/, message: "only letters and numbers allowed" }
  validates :custom_slug, uniqueness: true, allow_blank: true,
            length: { minimum: 3, maximum: 20, allow_blank: true },
            format: { with: /\A[a-zA-Z0-9\-_]+\z/, message: "only letters, numbers, hyphens, and underscores", allow_blank: true }
  validates :title, length: { maximum: 255 }, allow_blank: true
  validate :expires_at_must_be_in_future, if: -> { expires_at_changed? && expires_at.present? }

  before_validation :generate_short_code, on: :create

  scope :active, -> { where(is_active: true) }
  scope :expired, -> { where("expires_at IS NOT NULL AND expires_at < ?", Time.current) }
  scope :not_expired, -> { where("expires_at IS NULL OR expires_at >= ?", Time.current) }
  scope :expiring_soon, -> { where("expires_at IS NOT NULL AND expires_at >= ?", Time.current).order(expires_at: :asc) }

  scope :with_click_stats, lambda {
    today_start = Time.current.beginning_of_day.utc.strftime("%Y-%m-%d %H:%M:%S")
    left_joins(:clicks)
      .select(
        "short_links.*",
        "COUNT(clicks.id) AS computed_total_clicks",
        "COUNT(CASE WHEN clicks.is_unique THEN 1 END) AS computed_unique_clicks",
        "COUNT(CASE WHEN clicks.clicked_at >= '#{today_start}' THEN 1 END) AS computed_clicks_today"
      )
      .group("short_links.id")
  }

  def accessible?
    is_active? && !expired?
  end

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def effective_code
    custom_slug.presence || short_code
  end

  private

  def expires_at_must_be_in_future
    if expires_at.present? && expires_at <= Time.current
      errors.add(:expires_at, "must be in the future")
    end
  end

  def generate_short_code
    return if short_code.present?

    retries = 0
    loop do
      self.short_code = SecureRandom.alphanumeric(6)
      break unless ShortLink.exists?(short_code: short_code)
      retries += 1
      raise "Failed to generate unique short code after #{MAX_CODE_RETRIES} attempts" if retries >= MAX_CODE_RETRIES
    end
  end
end
