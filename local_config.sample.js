exports.config = {
  base: '/flight-planner',
  base_url: 'http://localhost:3000/flight-planner/',
  mongodb: {
    user:'user',
    password:'password',
    host:'localhost:27017'
  },
  enable_import:true,
  analytics: {
    type: 'owa', // currently only owa (Open Web Analytics) is supported
    id: 'your analytics id',
    url: 'optional url to your analytics server'
  }
}