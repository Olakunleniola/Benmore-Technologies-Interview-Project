## Project Planner API

### GET /projects
- **Description:** Get a list of all projects.
- **Response:**
  - **Status Code:** 200 OK
  - **Content:** HTML data representing the list of projects.

---

### GET /projects?query=searchterm
- **Description:** Search for projects by title.
- **Parameters:**
  - `query` (string): The search term to query for.
- **Response:**
  - **Status Code:** 200 OK
  - **Content:** HTML data of the project found, if any, otherwise 404 Not Found.

---

### GET /projects?percentage=completed or above_50 or below_50 or all
- **Description:** Get projects based on completion percentage categories.
- **Parameters:**
  - `percentage` (string): Options - "completed", "above_50", "below_50", or "all".
- **Response:**
  - **Status Code:** 200 OK
  - **Content:** HTML data of projects filtered by the completion percentage category.

---

### POST /projects
- **Description:** Create a new project with provided form data of title and image.
- **Request Body:**
  - `title` (string): Title of the project.
  - `image` (file): Image file for the project (optional).
- **Response:**
  - **Status Code:** 201 Created
  - **Content:** HTML data of the newly created project.

---

### PUT /projects/{id}
- **Description:** Edit a project by its ID.
- **Parameters:**
  - `id` (integer): The ID of the project to be edited.
- **Request Body:**
  - `title` (string, optional): Updated title of the project.
  - `image` (file, optional): Updated image file for the project.
- **Response:**
  - **Status Code:** 200 OK
  - **Content:** HTML data of the updated project.

---

### DELETE /projects/{id}
- **Description:** Delete a project by its ID.
- **Parameters:**
  - `id` (integer): The ID of the project to be deleted.
- **Response:**
  - **Status Code:** 204 No Content

---

### POST /projects/{id}/task
- **Description:** Create a task for a specific project.
- **Parameters:**
  - `id` (integer): The ID of the project to add the task to.
- **Request Body:**
  - `title` (string): Title of the task.
  - `description` (string): Description of the task.
  - `completed_status` (boolean): Completion status of the task.
- **Response:**
  - **Status Code:** 201 Created
  - **Content:** HTML data of the newly created task.

---

Please replace `{id}` with the actual ID of the project in the URL paths.
