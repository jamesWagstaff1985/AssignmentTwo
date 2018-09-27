# AssignmentTwo

A restful API that listens on both ports, 5000 and 5001 for hhtp and https requests.

User can be created by sending a post request to /users

## Create user example (post)
` /users ` <br/>
``` {
	"name" : "John doe",
	"emailAddress" : "johnDoe@swaga.com",
	"streetAddress" : {
		"street":"long road",
		"number":"11123"
	},
	"password" : "myTopSecretPassword"
}
```

## Create a token (post)
` /tokens ` <br/>
`` {
	"name" : "John doe",
	"password" : "myTopSecretPassword"
}
``

## Get menu items (get)
` /menu `

## Send an order (post)
` /menu `

Add your token to the headers with a key called 'id'
example ` id   a8xhz4exwj4ubueov40x  `

``` { "name" : "james Wagstaff",
	"order" : {
  "Hawaiian": 2,
  "Mexican": 1,
  "Lemonade": 2
  }
  }
```

A test visa will be charged and a confirmation of the billing will be sent to your email address.
