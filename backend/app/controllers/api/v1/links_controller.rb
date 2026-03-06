module Api
  module V1
    class LinksController < ApplicationController
      before_action :authenticate_user!
      before_action :set_link, only: [:show, :update, :destroy, :toggle]

      def index
        links = current_user.short_links.with_click_stats

        if params[:search].present?
          q = "%#{params[:search]}%"
          links = links.where("title ILIKE :q OR original_url ILIKE :q OR short_code ILIKE :q", q: q)
        end

        links = case params[:sort]
                when "clicks"
                  links.order("computed_total_clicks DESC")
                when "expiring"
                  links.where("expires_at IS NOT NULL AND expires_at >= ?", Time.current)
                       .order(expires_at: :asc)
                else
                  links.order(created_at: :desc)
                end

        links = links.page(params[:page]).per(params[:per_page] || 20)

        render json: {
          links: ShortLinkBlueprint.render_as_hash(links, view: :with_stats),
          meta: { current_page: links.current_page, total_pages: links.total_pages, total_count: links.total_count }
        }
      end

      def show
        render json: ShortLinkBlueprint.render_as_hash(@link, view: :with_stats)
      end

      def create
        link = current_user.short_links.build(link_params)

        if params[:subdomain].present?
          subdomain = current_user.subdomains.find_by(name: params[:subdomain])
          unless subdomain
            render json: { error: "Subdomain '#{params[:subdomain]}' not found or does not belong to you" }, status: :unprocessable_entity and return
          end
          link.subdomain = subdomain
        end

        if link.save
          render json: ShortLinkBlueprint.render_as_hash(link, view: :with_stats), status: :created
        else
          render json: { errors: link.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @link.update(update_params)
          render json: ShortLinkBlueprint.render_as_hash(@link.reload, view: :with_stats)
        else
          render json: { errors: @link.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        if @link.destroy
          render json: { message: "Link deleted" }
        else
          render json: { errors: ["Failed to delete link"] }, status: :unprocessable_entity
        end
      end

      def toggle
        if @link.update(is_active: !@link.is_active)
          render json: ShortLinkBlueprint.render_as_hash(@link, view: :with_stats)
        else
          render json: { errors: @link.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_link
        @link = current_user.short_links.find(params[:id])
      end

      def link_params
        params.permit(:original_url, :custom_slug, :title, :expires_at)
      end

      def update_params
        params.permit(:original_url, :custom_slug, :title, :expires_at, :is_active)
      end
    end
  end
end
