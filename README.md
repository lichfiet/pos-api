# pos-project

### adding dependencies

```
bun add dependency_name
bun add -d @types/dependency_name
```


# notes to run auth and test

1. `cd fusionauth/` and run `docker compose up -d`
2. once everything is up, go to localhost:9011, create an account
3. Click on applications on the left
4. Add new with button on top right
5. set name dev, leave id blank
6. in roles tab, add default role
7. in security tab, disable "require an api key"
8. in JWT tab, enable JWT
9. Save
10. Go back into the new application, oauth tab, and copy the client id, client secret, and applicatin id (top of the window above oauth tab) into the root .env file

11. back in fusion auth, expand settings, scroll to find "Key Master", and open
12. click "generate EC key pair" in top right
13. add a name (ex. dev), issuer = http://localhost:9011 and save
14. then go to tenants on the side bar
15. modify the "Default"
16. go to JWT tab and select your new key in the access token signing key dropdown, and the id token signing key dropdown
17. go to security tab and disable require api key
18. in general tab, change the issuer to the same localhost url.

19. you might also have to go back into the application and change the key for oauth to the new on you created but it should be okay.

-- TESTING

Login Fusion: fusion has url http://localhost:9011/api/login to get a token, in the request body, you need to have

```
{
    "loginId": "sortaminty@gmail.com",
    "password": "M!nt1y1e",
    "applicationId":"1f1854e8-6114-4efd-945e-2516e3d94767"
}
```

replace the information with what you created, and try it in postman. will share the collection of endpoints for testing so you don't have to type it all out. If you get any errors, you 

Login API: once you know fusion login is working, you can move on to node. url is http://localhost:8000/login and you just need this request body

```
{
    "loginId": "sortaminty@gmail.com",
    "password": "M!nt1y1e"
}
```

to test the token returned you can use http://localhost:8000/auth

and you need to set either a header authorization: "Bearer <token>" or use the bearer token auth option in your api tester, and just paste your token you just received.

if you have issues, wiggle around with it, you might need to go back and make sure there are not issuer urls I missed in any of the application, tenants, or whatever, might need to also change the key in some other spots, will automate soon
