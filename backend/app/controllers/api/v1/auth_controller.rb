module Api
  module V1
    class AuthController < ApplicationController
      def signup
        user = User.new(auth_params)
        if user.save
          token = JwtService.encode(user_id: user.id)
          render json: { token: token, user: UserBlueprint.render_as_hash(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: params[:email]&.downcase)
        if user&.valid_password?(params[:password])
          token = JwtService.encode(user_id: user.id)
          render json: { token: token, user: UserBlueprint.render_as_hash(user) }
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def logout
        render json: { message: "Logged out" }
      end

      private

      def auth_params
        params.permit(:email, :password, :password_confirmation)
      end
    end
  end
end
