class CreateApiKeys < ActiveRecord::Migration[7.2]
  def change
    create_table :api_keys do |t|
      t.references :user, null: false, foreign_key: true
      t.string :api_key, null: false
      t.string :key_prefix, null: false
      t.string :name
      t.datetime :expires_at
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end

    add_index :api_keys, :api_key, unique: true
    add_index :api_keys, :key_prefix
  end
end
