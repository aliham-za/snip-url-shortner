class CreateClicks < ActiveRecord::Migration[7.2]
  def change
    create_table :clicks do |t|
      t.references :short_link, null: false, foreign_key: true
      t.string :ip_address
      t.string :country
      t.string :city
      t.string :referrer
      t.string :browser
      t.string :os
      t.boolean :is_unique, default: false, null: false
      t.datetime :clicked_at, null: false, default: -> { "CURRENT_TIMESTAMP" }
    end

    add_index :clicks, :clicked_at
    add_index :clicks, [:short_link_id, :ip_address]
  end
end
