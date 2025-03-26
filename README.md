# Roomify

Roomify is a full-stack application for designing and visualizing rooms in both 2D and 3D. The project consists of a Flask backend for API calls, a TypeScript-based 3D room viewer with AR support, and a static frontend for interacting with the system.

## Project Structure

```
Roomify/
│-- pscmr/        # Flask backend for 2D room generation and API calls
│-- 3d_room/      # TypeScript-based 3D room rendering with AR view
│-- frontend/     # Contains the index.html file
│-- README.md     # Project documentation
```

## Getting Started

Follow these steps to run the project:

### 1. Run the Flask Backend (2D Room API)

Navigate to the `pscmr` folder and start the Flask server:
```sh
cd pscmr
python app.py
```

### 2. Start the 3D Room React App (with AR View)

In a new terminal, navigate to the `3d_room` folder and start the React application:
```sh
cd ../3d_room
npm install  # Install dependencies (only needed once)
npm start    # Run the React app
```

### 3. Open the Frontend

Finally, open the `frontend` folder and launch `index.html` in a web browser:
```sh
cd ../frontend
open index.html  # For MacOS
# OR
start index.html  # For Windows
# OR
xdg-open index.html  # For Linux
```

## Requirements

Make sure you have the following installed:
- Python 3.x
- Flask (`pip install flask`)
- Node.js & npm
- TypeScript (`npm install -g typescript`)

## Contributing
Feel free to submit issues and pull requests to improve Roomify.

## License
This project is licensed under the MIT License.

