class CreateShortLinks < ActiveRecord::Migration[7.2]
  def change
    create_table :short_links do |t|
      t.references :user, null: false, foreign_key: true
      t.string :original_url, null: false
      t.string :short_code, null: false
      t.string :custom_slug
      t.string :title
      t.boolean :is_active, default: true, null: false
      t.datetime :expires_at
      t.timestamps
    end

    add_index :short_links, :short_code, unique: true
    add_index :short_links, :custom_slug, unique: true
  end
end
