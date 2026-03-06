class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    decoded = JwtService.decode(token)

    @current_user = User.find_by(id: decoded[:user_id]) if decoded
    render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
  end

  def current_user
    @current_user
  end

  private

  def not_found
    render json: { error: "Not found" }, status: :not_found
  end

  def unprocessable(exception)
    render json: { errors: exception.record.errors.full_messages }, status: :unprocessable_entity
  end
end
