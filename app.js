const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const { format, isValid, parseISO } = require("date-fns");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running.....");
    });
  } catch (e) {
    console.log(e.message);
  }
};
initializer();

const isValidStatus = (request, response, next) => {
  const { status } = request.query;
  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const validStatus = statusArray.includes(status);
    if (validStatus) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    next();
  }
};

const isValidCategory = (request, response, next) => {
  const { category } = request.query;
  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const validCategory = categoryArray.includes(category);
    if (validCategory) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    next();
  }
};

const isValidPriority = (request, response, next) => {
  const { priority } = request.query;
  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const validPriority = priorityArray.includes(priority);
    if (validPriority) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    next();
  }
};

function convert(ob) {
  return {
    id: ob.id,
    todo: ob.todo,
    priority: ob.priority,
    status: ob.status,
    category: ob.category,
    dueDate: ob.due_date,
  };
}

//first api
app.get(
  "/todos/",
  isValidStatus,
  isValidPriority,
  isValidCategory,
  async (request, response) => {
    const { status, priority, category, search_q } = request.query;
    let queriesQuery = "";
    if (search_q !== undefined) {
      queriesQuery = `todo LIKE '%${search_q}%'`;
    }
    if (status !== undefined) {
      if (queriesQuery === "") {
        queriesQuery += `status='${status}'`;
      } else {
        queriesQuery += ` AND status='${status}'`;
      }
    }
    if (priority !== undefined) {
      if (queriesQuery === "") {
        queriesQuery += `priority='${priority}'`;
      } else {
        queriesQuery += ` AND priority='${priority}'`;
      }
    }
    if (category !== undefined) {
      if (queriesQuery === "") {
        queriesQuery += `category='${category}'`;
      } else {
        queriesQuery += ` AND category='${category}'`;
      }
    }

    let dbQuery;
    if (queriesQuery === "") {
      dbQuery = `SELECT * FROM todo`;
    } else {
      dbQuery = `SELECT * FROM todo
        WHERE ${queriesQuery}`;
    }
    const result = await db.all(dbQuery);
    response.send(result.map(convert));
  }
);

//api-2
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const requestQuery = `
    SELECT * FROM todo
    WHERE id=${todoId}`;
  const result = await db.get(requestQuery);
  response.send(convert(result));
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  let dateFormat;
  if (isValid(new Date(date))) {
    dateFormat = format(new Date(date), "yyyy-MM-dd");
    const dateQuery = `
    SELECT * FROM todo
    WHERE due_date='${dateFormat}';`;
    const result = await db.all(dateQuery);
    response.send(result.map(convert));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
const isValidStatus1 = (request, response, next) => {
  const { status } = request.body;
  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const validStatus = statusArray.includes(status);
    if (validStatus) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    next();
  }
};

const isValidCategory1 = (request, response, next) => {
  const { category } = request.body;
  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const validCategory = categoryArray.includes(category);
    if (validCategory) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    next();
  }
};

const isValidPriority1 = (request, response, next) => {
  const { priority } = request.body;
  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const validPriority = priorityArray.includes(priority);
    if (validPriority) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    next();
  }
};
const isValidDate = (request, response, next) => {
  const { dueDate } = request.body;
  if (dueDate !== undefined) {
    const validDate = isValid(new Date(dueDate));
    if (validDate) {
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    next();
  }
};

//api 4
app.post(
  "/todos",
  isValidStatus1,
  isValidPriority1,
  isValidCategory1,
  isValidDate,
  async (request, response) => {
    const { id, todo, priority, status, category, dueDate } = request.body;
    dateFormat = format(new Date(dueDate), "yyyy-MM-dd");
    const postQuery = `
    INSERT INTO todo
    (id,todo,priority,status,category,due_date)
    VALUES (${id},'${todo}','${priority}','${status}','${category}','${dateFormat}')`;
    const result = await db.run(postQuery);
    response.send("Todo Successfully Added");
  }
);

//api5
app.put(
  "/todos/:todoId/",
  isValidStatus1,
  isValidPriority1,
  isValidCategory1,
  isValidDate,
  async (request, response) => {
    const { todoId } = request.params;
    let update;
    const requestBody = request.body;
    if (requestBody.todo !== undefined) {
      update = "Todo";
    }
    if (requestBody.status !== undefined) {
      update = "Status";
    }
    if (requestBody.priority !== undefined) {
      update = "Priority";
    }
    if (requestBody.category !== undefined) {
      update = "Category";
    }
    if (requestBody.dueDate !== undefined) {
      update = "Due Date";
    }
    const requestQuery = `
    SELECT * FROM todo
    WHERE id=${todoId}`;
    const previous = await db.get(requestQuery);
    const {
      todo = previous.todo,
      status = previous.status,
      category = previous.category,
      priority = previous.priority,
      dueDate = previous.due_date,
    } = request.body;

    const putQuery = `
    UPDATE todo
    SET 
      todo = '${todo}',
      status = '${status}',
      category = '${category}',
      priority = '${priority}',
      due_date = '${dueDate}'
      WHERE id=${todoId}`;
    const putResult = await db.run(putQuery);
    response.send(`${update} Updated`);
  }
);
//todo6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const details = `
    DELETE FROM todo 
    WHERE id = ${todoId};`;
  const result = await db.run(details);
  response.send("Todo Deleted");
});
module.exports = app;
