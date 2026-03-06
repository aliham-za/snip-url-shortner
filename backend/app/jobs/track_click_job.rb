class TrackClickJob < ApplicationJob
  queue_as :default

  def perform(short_link_id, ip_address, referrer, user_agent)
    link = ShortLink.find_by(id: short_link_id)
    return unless link
    return if ip_address.blank?

    browser_obj = Browser.new(user_agent.to_s)

    geo = begin
      Geocoder.search(ip_address).first
    rescue StandardError => e
      Rails.logger.warn("Geocoder failed for #{ip_address}: #{e.message}")
      nil
    end

    link.clicks.create(
      ip_address: ip_address,
      referrer: referrer.presence || "Direct",
      browser: browser_obj.name.presence || "Unknown",
      os: browser_obj.platform&.name.presence || "Unknown",
      country: geo&.country.presence || "Unknown",
      city: geo&.city.presence || "Unknown",
      clicked_at: Time.current
    )
  rescue StandardError => e
    Rails.logger.error("TrackClickJob failed for link #{short_link_id}: #{e.message}")
  end
end
