let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH,DELETE,HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
const port = process.env.PORT||2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
let mysql = require("mysql");
let connData = {
  host: "localhost",
  user: "root",
  password: "",
  database: "task-7",
};
app.get("/svr/employees", function (req, res) {
  let departmentStr = req.query.department;
  let designationStr = req.query.designation;
  let genderStr = req.query.gender;
  let connection = mysql.createConnection(connData);
  let sql = "SELECT * FROM employees";
  connection.query(sql, function (err, result) {
    if (err) res.status(404).send(err);
    else {
      if(departmentStr){
        console.log(departmentStr);
        result=result.filter(e=>e.department===departmentStr);
      }
      if(designationStr){
        console.log(designationStr);
        result=result.filter(e=>e.designation===designationStr);
      }
      if(genderStr){
        console.log(genderStr);
        result=result.filter(e=>e.gender===genderStr);
      }
      res.send(result);
    }
  });
});
app.get("/svr/employees/:id", function (req, res) {
  let id = +req.params.id;
  let connection = mysql.createConnection(connData);
  let sql = "SELECT * FROM employees WHERE empcode=?";
  connection.query(sql, id, function (err, result) {
    if (err) res.status(404).send(err);
    else {
      res.send(result);
    }
  });
});
app.get("/svr/employees/designation/:designation", function (req, res) {
  let designationStr = req.params.designation;
  console.log(designationStr);
  let connection = mysql.createConnection(connData);
  let sql = "SELECT * FROM employees WHERE designation=?";
  connection.query(sql, designationStr, function (err, result) {
    if (err) res.status(404).send(err);
    else {
      res.send(result);
    }
  });
});
app.get("/svr/employees/department/:department", function (req, res) {
  let departmentStr = req.params.department;
  //console.log(departmentStr);
  let connection = mysql.createConnection(connData);
  let sql = "SELECT * FROM employees WHERE department=?";
  connection.query(sql, departmentStr, function (err, result) {
    if (err) res.status(404).send(err);
    else {
      res.send(result);
    }
  });
});
app.post("/svr/employees", function (req, res) {
  let body = req.body;
  let connection = mysql.createConnection(connData);
  let sql = "SELECT * FROM employees";
  connection.query(sql, function (err, result) {
    if (err) res.status(404).send(err);
    else {
      let maxid = result.reduce(
        (acc, curr) => (acc > curr.empcode ? acc : curr.empcode),
        0
      );
      console.log(maxid);
      let newEmployees = [{ ...body, empcode: maxid + 1 }];
      let arr = newEmployees.map((e) => [
        e.empcode,
        e.name,
        e.department,
        e.designation,
        e.salary,
        e.gender,
      ]);
      let connection = mysql.createConnection(connData);
      let sql =
        "INSERT INTO employees(empcode,name,department,designation,salary,gender) VALUES ?";
      connection.query(sql, [arr], function (err, result) {
        if (err) res.status(404).send(err);
        else res.send(newEmployees);
      });
    }
  });
});

app.put("/svr/employees/:id", function (req, res) {
  let id = +req.params.id;
  let body = req.body;
  console.log(id);
  let connection = mysql.createConnection(connData);
  let sql = "SELECT * FROM employees";
  connection.query(sql, function (err, result) {
    if (err) res.status(404).send(err);
    else {
      let index = result.findIndex((e) => e.empcode === id);
      if (index >= 0) {
        let update = { ...body, empcode: id };
        let connection = mysql.createConnection(connData);
        let sql =
          "UPDATE employees SET name=?,department=?,designation=?,salary=?,gender=? WHERE empcode=? ";
        connection.query(
          sql,
          [
            update.name,
            update.department,
            update.designation,
            update.salary,
            update.gender,
            update.empcode,
          ],
          function (err, result) {
            if (err) res.status(404).send(err);
            else {
              res.send(update);
            }
          }
        );
      } else {
        res.status(404).send("No Employee Found");
      }
    }
  });
});

app.delete("/svr/employees/:id", function (req, res) {
  let id = +req.params.id;
  let body = req.body;
  console.log(id);
  let connection = mysql.createConnection(connData);
  let sql = "SELECT * FROM employees";
  connection.query(sql, function (err, result) {
    if (err) res.status(404).send(err);
    else {
      let index = result.findIndex((e) => e.empcode === id);
      if (index >= 0) {
        let deleteEmp = { ...body, empcode: id };
        let connection = mysql.createConnection(connData);
        let sql = "DELETE FROM employees WHERE empcode=? ";
        connection.query(sql, id, function (err, result) {
          if (err) res.status(404).send(err);
          else {
            res.send(deleteEmp);
          }
        });
      } else {
        res.status(404).send("No Mobile Found");
      }
    }
  });
});
