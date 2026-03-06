module Api
  module V1
    class DashboardController < ApplicationController
      before_action :authenticate_user!

      def stats
        links = current_user.short_links
        render json: {
          total_links: links.count,
          active_links: links.where(is_active: true).count,
          total_clicks: current_user.clicks.count,
          unique_clicks: current_user.clicks.where(is_unique: true).count,
          clicks_today: current_user.clicks.where("clicked_at >= ?", Time.current.beginning_of_day).count
        }
      end
    end
  end
end
