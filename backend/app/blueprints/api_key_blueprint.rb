class ApiKeyBlueprint < Blueprinter::Base
  identifier :id
  fields :key_prefix, :name, :is_active, :expires_at, :created_at

  field :status do |key|
    if key.expired?
      "expired"
    elsif !key.is_active?
      "revoked"
    else
      "active"
    end
  end

  view :with_raw_key do
    field :raw_key do |_key, options|
      options[:raw_key]
    end
  end
end
