class Subdomain < ApplicationRecord
  RESERVED_NAMES = %w[api www admin app mail ftp smtp pop imap ns1 ns2 cdn assets static].freeze

  belongs_to :user
  has_many :short_links, dependent: :nullify

  validates :name, presence: true,
            uniqueness: { case_sensitive: false },
            length: { minimum: 3, maximum: 63 },
            format: {
              with: /\A[a-z0-9]([a-z0-9\-]*[a-z0-9])?\z/,
              message: "must be lowercase alphanumeric (hyphens allowed, not at start/end)"
            }
  validate :not_reserved_name

  before_validation :normalize_name

  private

  def normalize_name
    self.name = name&.strip&.downcase
  end

  def not_reserved_name
    errors.add(:name, "is reserved and cannot be used") if RESERVED_NAMES.include?(name)
  end
end
