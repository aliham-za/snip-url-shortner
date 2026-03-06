class AddSubdomainIdToShortLinks < ActiveRecord::Migration[7.2]
  def change
    add_reference :short_links, :subdomain, null: true, foreign_key: true
    add_index :short_links, [:subdomain_id, :short_code], unique: true, name: "index_short_links_on_subdomain_and_code"
  end
end
