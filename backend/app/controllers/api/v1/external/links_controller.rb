module Api
  module V1
    module External
      class LinksController < ApplicationController
        include ApiKeyAuthenticatable

        def create
          link = current_user.short_links.new(link_params)

          if params[:subdomain].present?
            render json: { error: "Custom subdomains are coming soon" }, status: :unprocessable_entity and return
          end

          if link.save
            render json: ShortLinkBlueprint.render(link, view: :external), status: :created
          else
            render json: { errors: link.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def link_params
          params.permit(:original_url, :custom_slug, :title)
        end
      end
    end
  end
end
