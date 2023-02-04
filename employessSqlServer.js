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
const port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  password: "Jalmejay@10",
  database: "postgres",
  port: 5432,
  host: "db.hggcdvzvjldnatkxcatw.supabase.co",
  ssl: { rejectUnauthorized: false },
});
client.connect(function (res, error) {
  console.log(`Connected!!!`);
});
app.get("/svr/employees", function (req, res) {
  let departmentStr = req.query.department;
  let designationStr = req.query.designation;
  let genderStr = req.query.gender;
  console.log(departmentStr);
  console.log("Inside /svr/employees get api");
  const query = "SELECT * FROM employees";
  client.query(query, function (err, result) {
    if (err) {
      res.status(400).send(err);
    } else {
      console.log("result", result);
      if (departmentStr) {
        console.log(departmentStr);
        result.rows = result.rows.filter((e) => e.department === departmentStr);
      }
      if (designationStr) {
        console.log(designationStr);
        result.rows = result.rows.filter(
          (e) => e.designation === designationStr
        );
      }
      if (genderStr) {
        console.log(genderStr);
        result.rows = result.rows.filter((e) => e.gender === genderStr);
      }
      console.log("result.row", result.rows);
      res.send(result.rows);
      client.end();
    }
  });
});
app.get("/svr/employees/:id", function (req, res) {
  let id = +req.params.id;
  let values = [id];
  const query = "SELECT * FROM employees WHERE empcode=$1";
  client.query(query, values, function (err, result) {
    if (err) res.status(404).send(err);
    else {
      res.send(result.rows);
      client.end();
    }
  });
});
app.get("/svr/employees/designation/:designation", function (req, res) {
  let designationStr = req.params.designation;
  console.log(designationStr);
  let values = [designationStr];
  console.log(values);
  let query = "SELECT * FROM employees WHERE designation=$1";
  client.query(query, values, function (err, result) {
    if (err) res.status(404).send(err);
    else {
      res.send(result.rows);
      client.end();
    }
  });
});
app.get("/svr/employees/department/:department", function (req, res) {
  let departmentStr = req.params.department;
  console.log(departmentStr);
  let query = "SELECT * FROM employees WHERE department=$1";
  client.query(query, [departmentStr], function (err, result) {
    if (err) res.status(404).send(err);
    else {
      res.send(result.rows);
      client.end();
    }
  });
});
app.post("/svr/employees", function (req, res) {
  console.log("Inside post of employees");
  let body = req.body;
  const query = "SELECT * FROM employees";
  client.query(query, function (err, result) {
    if (err) res.status(404).send(err);
    else {
      console.log(result.rows);
      let maxid = result.rows.reduce(
        (acc, curr) => (acc > curr.empcode ? acc : curr.empcode),
        0
      );
      console.log(maxid);
      let newEmployees = "";
      if (body.empcode) {
        newEmployees = { ...body };
      } else {
        newEmployees = { empcode: maxid + 1, ...body };
      }
      console.log(newEmployees);
      let values = Object.values(newEmployees);
      console.log("values", values);
      const query = `INSERT INTO employees (empcode,name,department,designation,salary,gender) VALUES ($1,$2,$3,$4,$5,$6)`;
      client.query(query, values, function (err, result) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(`${result.rows} insertion successfull`);
          client.end();
        }
      });
    }
  });
});

app.put("/svr/employees/:id", function (req, res) {
  let id = +req.params.id;
  let body = req.body;
  console.log(id);
  let query = "SELECT * FROM employees";
  client.query(query, function (err, result) {
    if (err) {
      console.log("error");
      res.status(400).send(err);
    } else {
      let index = result.rows.findIndex((e) => e.empcode === id);
      console.log(index);
      if (index >= 0) {
        let update = { ...body, empcode: id };
        let values = Object.values(update);
        console.log(values);
        const query =
          "UPDATE employees SET name=$1,department=$2,designation=$3,salary=$4,gender=$5 WHERE empcode=$6 ";
        client.query(query, values, function (err, result) {
          if (err) res.status(400).send(err);
          else {
            res.send(update);
            client.end();
          }
        });
      } else {
        res.status(400).send("No Employee Found");
      }
    }
  });
});

app.delete("/svr/employees/:id", function (req, res) {
  let id = +req.params.id;
  let body = req.body;
  console.log(id);
  const query = "SELECT * FROM employees";
  client.query(query, function (err, result) {
    if (err) res.status(400).send(err);
    else {
      let index = result.rows.findIndex((e) => e.empcode === id);
      if (index >= 0) {
        let deleteEmp = { ...body, empcode: id };
        const query = "DELETE FROM employees WHERE empcode=$1";
        client.query(query, [id], function (err, result) {
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
