# Place It Backend

This is the backend for the Place It application, which allows users to explore and share their travel experiences.

## Prerequisites

- Docker
- Node.js (v14 or higher)
- npm (Node Package Manager)

## Running MongoDB in Docker

1. **Pull the MongoDB Docker image**:
   ```bash
   docker pull mongo
   ```

2. **Run MongoDB container**:
   ```bash
   docker run --name place-it-mongo -d -p 27017:27017 mongo
   ```

   This command will run a MongoDB container named `place-it-mongo` in detached mode and map port `27017` of the container to port `27017` on your host machine.

3. **Verify that MongoDB is running**:
   You can check the logs of the MongoDB container to ensure it's running correctly:
   ```bash
   docker logs place-it-mongo
   ```

## Setting Up the Application

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ujjwal3009/place.itbackend.git
   cd place.itbackend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file**:
   Create a `.env` file in the root of the project and add the following environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/your_database_name
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   LOG_LEVEL=info
   ```

   Replace `your_database_name` with the name you want for your MongoDB database.

4. **Run the application**:
   ```bash
   npm run dev
   ```

   This command will start the application in development mode.

## Adding Remote Origin

If you have cloned the repository and want to set the remote origin, you can do so with the following command:

```bash
git remote add origin https://github.com/Ujjwal3009/place.itbackend.git
```

## API Endpoints

- **Register User**: `POST /api/auth/register`
- **Login User**: `POST /api/auth/login`
- **Get All Places**: `GET /api/places`
- **Discover Places**: `GET /api/places/discover`
- **Get Place by ID**: `GET /api/places/:id`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
