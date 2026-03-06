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
    code = params[:short_code]

    ShortLink.find_by(short_code: code) ||
      ShortLink.find_by(custom_slug: code)
  end
end
