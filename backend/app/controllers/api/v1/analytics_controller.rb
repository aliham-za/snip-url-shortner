module Api
  module V1
    class AnalyticsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_link

      def show
        days = (params[:days] || 30).to_i.clamp(1, 365)
        clicks = @link.clicks.where("clicked_at >= ?", days.days.ago)

        render json: {
          total_clicks: @link.clicks.count,
          unique_clicks: @link.clicks.where(is_unique: true).count,
          clicks_over_time: clicks_over_time(clicks, days),
          top_referrers: top_group(clicks, :referrer),
          top_countries: top_group(clicks, :country),
          top_browsers: top_group(clicks, :browser),
          top_os: top_group(clicks, :os)
        }
      end

      def clicks
        days = (params[:days] || 30).to_i.clamp(1, 365)
        click_data = @link.clicks.where("clicked_at >= ?", days.days.ago)

        render json: {
          clicks_over_time: clicks_over_time(click_data, days),
          total: click_data.count,
          unique: click_data.where(is_unique: true).count
        }
      end

      private

      def set_link
        @link = current_user.short_links.find(params[:link_id])
      end

      def clicks_over_time(clicks, days)
        start_date = days.days.ago.to_date
        grouped = clicks.group("DATE(clicked_at)").count
        (start_date..Date.current).map do |date|
          { date: date.to_s, clicks: grouped[date] || 0 }
        end
      end

      def top_group(clicks, field)
        clicks.where.not(field => [nil, "", "Unknown"])
              .group(field)
              .order("count_all DESC")
              .limit(10)
              .count
              .map { |name, count| { name: name, count: count } }
      end
    end
  end
end
