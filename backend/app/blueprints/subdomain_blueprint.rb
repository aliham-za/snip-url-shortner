class SubdomainBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :created_at

  field :links_count do |subdomain|
    subdomain.short_links.count
  end
end
