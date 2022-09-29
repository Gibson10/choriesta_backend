
# Choreista Backend Source Code
To run this application, you must do the following.
### Clone the application locally
### install npm   globally on your laptop
### Create .env file and add the following

#### MongoDB credentials
This project uses mongodb as the database. It uses the service offered by [atlas](https://www.mongodb.com/cloud/atlas). Please read the [docs](https://docs.atlas.mongodb.com/tutorial/create-new-cluster/) to understand how to create a cluster and database user. Once you are done with the process in the doc. Please get the following values and paste them into your .env file
* `DB_USER`=user-name
* `DB_PASS`=user-password
* `DB_NAME`=database-name
* `DB_HOST`= cluster host (example 'cluster0.ydxk3.mongodb.net')

## Node Environment

* `NODE_ENV`= can be `development` ,`staging` or `production`
* `secret`: "your hashing secret",

## Email sending client
In this project we use sendgrid as an email sending client. To successfully integrate sendgrid
create an [account here](https://sendgrid.com/). With your account created navigate to the settings where you will create your [api key](https://docs.sendgrid.com/ui/account-and-settings/api-keys). Then create a [sender](https://docs.sendgrid.com/ui/sending-email/senders#:~:text=Adding%20a%20Sender,-You%20are%20required&text=To%20add%20a%20Sender%3A,page%20and%20then%20click%20Save). The sender email will be used to send all emails from this platform. Lastly, this project uses sendgrid templates to structure the email format. You will need to create an [email template](https://docs.sendgrid.com/ui/sending-email/create-and-edit-legacy-transactional-templates) and get its id. The ID is visible on the template after you create it. Get the API_KEY, the sender email and the template IDs of all the templates you created and add them to the env

* `WELCOME_TEMPLATE`=template id
* `RESET_TEMPLATE`= template id
* `SENDGRID_API_KEY`=your api key
* `FROM_EMAIL` =your sender email

### File storage
This project uses AWS to store assets such as images. You will need to create an [aws account](https://aws.amazon.com/) to and get your access-id and secret key to get remote access to aws from nodejs. You will then need to create an [S3 Bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html) and make it publicly available for you to add files to it.
* `CHORIESTA_AWS_ACCESS_ID`= your access id
* `CHORIESTA_AWS_SECRET_KEY`=your aws secret key
* `BUCKET_NAME`=your bucket name


## To install all libraries
* `npm install`

## To run the project
* `npm start`

# choriesta_backend
