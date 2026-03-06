module Api
  module V1
    class SubdomainsController < ApplicationController
      before_action :authenticate_user!

      def index
        subdomains = current_user.subdomains.order(created_at: :desc)
        render json: SubdomainBlueprint.render(subdomains)
      end

      def create
        subdomain = current_user.subdomains.new(subdomain_params)

        if subdomain.save
          render json: SubdomainBlueprint.render(subdomain), status: :created
        else
          render json: { errors: subdomain.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        subdomain = current_user.subdomains.find(params[:id])

        if subdomain.update(subdomain_params)
          render json: SubdomainBlueprint.render(subdomain)
        else
          render json: { errors: subdomain.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        subdomain = current_user.subdomains.find(params[:id])
        subdomain.destroy!
        render json: { message: "Subdomain deleted" }
      end

      private

      def subdomain_params
        params.permit(:name)
      end
    end
  end
end
