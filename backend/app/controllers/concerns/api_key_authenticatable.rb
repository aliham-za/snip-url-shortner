module ApiKeyAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_api_key!
  end

  private

  def authenticate_api_key!
    raw_key = request.headers["X-Api-Key"]

    if raw_key.blank?
      render json: { error: "Unauthorized" }, status: :unauthorized and return
    end

    api_key = ApiKey.find_by_raw_key(raw_key)

    if api_key.nil?
      render json: { error: "Unauthorized" }, status: :unauthorized and return
    end

    if api_key.expired?
      render json: { error: "API key expired" }, status: :forbidden and return
    end

    unless api_key.is_active?
      render json: { error: "API key disabled" }, status: :forbidden and return
    end

    @current_api_key = api_key
    @current_user = api_key.user
  end

  def current_user
    @current_user
  end

  def current_api_key
    @current_api_key
  end
end
