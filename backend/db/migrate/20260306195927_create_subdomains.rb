class CreateSubdomains < ActiveRecord::Migration[7.2]
  def change
    create_table :subdomains do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end

    add_index :subdomains, :name, unique: true
  end
end
