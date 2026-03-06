class RedirectsController < ApplicationController
  def show
    link = resolve_link

    if link.nil?
      render json: { error: "Link not found" }, status: :not_found
    elsif !link.accessible?
      render json: { error: "Link is inactive or expired" }, status: :gone
    else
      TrackClickJob.perform_later(link.id, request.remote_ip, request.referrer.to_s, request.user_agent.to_s)
      redirect_to link.original_url, status: :moved_permanently, allow_other_host: true
    end
  end

  private

  def resolve_link
    subdomain_name = extract_subdomain

    if subdomain_name.present?
      subdomain = Subdomain.find_by(name: subdomain_name)
      return nil unless subdomain

      ShortLink.find_by(short_code: params[:short_code], subdomain: subdomain) ||
        ShortLink.find_by(custom_slug: params[:short_code], subdomain: subdomain)
    else
      ShortLink.find_by(short_code: params[:short_code], subdomain_id: nil) ||
        ShortLink.find_by(custom_slug: params[:short_code], subdomain_id: nil)
    end
  end

  def extract_subdomain
    tld_length = ENV.fetch("TLD_LENGTH", 1).to_i
    sub = request.subdomain(tld_length)
    sub.present? ? sub : nil
  end
end
