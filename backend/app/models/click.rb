class Click < ApplicationRecord
  belongs_to :short_link

  validates :ip_address, presence: true
  validates :clicked_at, presence: true

  before_create :detect_unique_click

  private

  def detect_unique_click
    self.is_unique = !short_link.clicks.where(ip_address: ip_address).exists?
  end
end
