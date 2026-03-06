module Api
  module V1
    class ApiKeysController < ApplicationController
      before_action :authenticate_user!

      def index
        keys = current_user.api_keys.order(created_at: :desc)
        render json: ApiKeyBlueprint.render(keys)
      end

      def create
        record, raw_key = ApiKey.generate(
          current_user,
          name: params[:name],
          expires_at: params[:expires_at]
        )

        render json: ApiKeyBlueprint.render(record, view: :with_raw_key, raw_key: raw_key), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      def destroy
        key = current_user.api_keys.find(params[:id])
        key.update!(is_active: false)
        render json: { message: "API key revoked" }
      end
    end
  end
end
