Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "auth/signup", to: "auth#signup"
      post "auth/login", to: "auth#login"
      delete "auth/logout", to: "auth#logout"

      resources :links, only: [:index, :show, :create, :update, :destroy] do
        patch :toggle, on: :member
        resource :analytics, only: [:show] do
          get :clicks, on: :collection
        end
      end

      get "dashboard/stats", to: "dashboard#stats"

      resources :api_keys, only: [:index, :create, :destroy]
      resources :subdomains, only: [:index, :create, :update, :destroy]

      namespace :external do
        post "shorten", to: "links#create"
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
  get ":short_code", to: "redirects#show", constraints: { short_code: /[a-zA-Z0-9\-_]+/ }
end
