const express = require("express");
const fs = require("fs");
const  path = require("path");


const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const ALLOWED_STATUSES = ["pending", "in-progress", "completed"];

let tasks =[];
let nextId=1;

//logger middleware
app.use((req,res,next)=>{
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} ${req.originalUrl}`);
    next();
})


//Task fields validation middleware
function validateTask(req,res,next){
    const method = req.method.toUpperCase();
    if(method !== "POST" && method != "PUT"){
        return next();
    }

    const {title,description,status}=req.body;

    if(method=="POST"){
        if(!title || typeof title !== "string" || !title.trim()){
            return res.status(400).json({
                 success: false,
        message: "Title is required and must be a non-empty string.",
            });
        }
         if (!description || typeof description !== "string" || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Description is required and must be a non-empty string.",
            });
    }
    }

    if(method==="PUT"){
        if("title" in req.body){
            if(!title || typeof title !== "string" || !title.trim()){
                return res.status(400).json({
                success: false,
                message: "If provided, title must be a non-empty string.",
            });
        }
    }

    if("description" in req.body){
        if(!description || typeof description !== "string" || !description.trim()){
            return res.status(400).json({
            success: false,
            message: "If provided, description must be a non-empty string.",
            });
        }
    }
}

    if("status" in req.body){
        if(!ALLOWED_STATUSES.includes(status)){
             return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(", ")}.`,
            });
        }
    }

next();
}

//Create task
app.post("/tasks",validateTask,(req,res,next)=>{
    try{
        const { title, description, status } = req.body;
        const task={
            id: nextId++,
            title: title.trim(),
            description: description.trim(),
            status: status && ALLOWED_STATUSES.includes(status) ? status : "pending",
            createdAt: new Date().toISOString(),
        }

        tasks.push(task);

        return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
        });

    }
    catch(err){
        next(err);
    }
});


//GET all tasks
app.get("/tasks",(req,res)=>{
    res.status(200).json({
    success: true,
    message: "Tasks retrieved successfully",
    data: tasks,
  });
});

//GET task by id
app.get("/tasks/:id",(req,res)=>{
    const id = parseInt(req.params.id);
    const task= tasks.find((t)=>t.id===id);
    if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Task retrieved successfully",
    data: task,
  });
});

//UPDATE Task
app.put("/tasks/:id", validateTask, (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  const { title, description, status } = req.body;

  if (title) task.title = title.trim();
  if (description) task.description = description.trim();
  if (status) task.status = status;

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
});

// Delete Task 
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  tasks.splice(index, 1);
  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});


















app.listen(PORT,()=>{console.log(`server running on http://localhost:${PORT}`);})
