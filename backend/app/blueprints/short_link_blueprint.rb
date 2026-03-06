class ShortLinkBlueprint < Blueprinter::Base
  identifier :id
  fields :original_url, :short_code, :custom_slug, :title, :is_active, :expires_at, :created_at

  field :subdomain_name do |link|
    link.subdomain&.name
  end

  field :short_url do |link|
    base = ENV.fetch("SHORT_URL_BASE", "http://localhost:3000").chomp("/")
    if link.subdomain.present?
      uri = URI.parse(base)
      uri.host = "#{link.subdomain.name}.#{uri.host}"
      "#{uri}/#{link.effective_code}"
    else
      "#{base}/#{link.effective_code}"
    end
  end

  view :external do
    excludes :is_active, :expires_at, :created_at
  end

  view :with_stats do
    field :total_clicks do |link|
      if link.respond_to?(:computed_total_clicks) && link.computed_total_clicks
        link.computed_total_clicks.to_i
      else
        link.clicks.count
      end
    end

    field :unique_clicks do |link|
      if link.respond_to?(:computed_unique_clicks) && link.computed_unique_clicks
        link.computed_unique_clicks.to_i
      else
        link.clicks.where(is_unique: true).count
      end
    end

    field :clicks_today do |link|
      if link.respond_to?(:computed_clicks_today) && link.computed_clicks_today
        link.computed_clicks_today.to_i
      else
        link.clicks.where("clicked_at >= ?", Time.current.beginning_of_day).count
      end
    end
  end
end
