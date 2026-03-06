class ApiKey < ApplicationRecord
  belongs_to :user

  validates :api_key, presence: true, uniqueness: true
  validates :key_prefix, presence: true

  scope :active, -> { where(is_active: true).where("expires_at IS NULL OR expires_at > ?", Time.current) }

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def active_for_auth?
    is_active? && !expired?
  end

  def self.generate(user, name: nil, expires_at: nil)
    raw_key = "sk_#{SecureRandom.hex(24)}"
    hashed  = Digest::SHA256.hexdigest(raw_key)
    prefix  = raw_key[0, 8]

    record = user.api_keys.create!(
      api_key: hashed,
      key_prefix: prefix,
      name: name,
      expires_at: expires_at
    )

    [record, raw_key]
  end

  def self.find_by_raw_key(raw_key)
    return nil if raw_key.blank?

    hashed = Digest::SHA256.hexdigest(raw_key)
    find_by(api_key: hashed)
  end
end
