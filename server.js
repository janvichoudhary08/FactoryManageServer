import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

//database setup

const app = express();

const PORT = process.env.PORT || 8081;



app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));
dotenv.config(); // Load environment variables



// MongoDB Connection
const connectionString = process.env.MONGO_URI; // Ensure this matches your .env variable
const client = new MongoClient(connectionString );



let db;

(async () => {
  try {
    await client.connect();
    db = client.db('factorymanage');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
})();

// Middleware
app.use(bodyParser.json());

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to Factory Manage Server!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//employee apis


app.post('/create', async (req, res) => {
  
    const newDocument = {
      name: req.body.name,
      date: req.body.joiningDate,
      day: req.body.weekday,
      salary: req.body.salary
    };
  console.log("New doc  ",newDocument);
  
    try {
      const result = await db.collection('employee').insertOne(newDocument);
      res.status(201).json({ status: 'Success' });
    } catch (error) {
      console.error('Error adding entry:', error);
      res.status(500).json({ error: 'Could not add entry' });
    }
  });
  


app.get('/getEmployee', async (req, res) => {
    try {
        const result = await db.collection('employee').find().toArray();
        return res.json({ status: 'Success', Result: result });
    } catch (error) {
        console.error('Error retrieving employees:', error);
        return  res.status(500).json({ error: 'Could not retrieve employees' });
    }
});


app.get('/get/:id', async (req, res) => {
    const employeeId = req.params.id;

    try {
        const result = await db.collection('employee').findOne({ _id: new ObjectId(employeeId) });
        if (!result) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        return res.json({ Result: result });
    } catch (error) {
        console.error('Error getting employee details:', error);
        return res.status(500).json({ error: 'Error getting employee details' });
    }
});


app.put('/update/:id', async (req, res) => {
    const employeeId = req.params.id;

    try {
        const result = await db.collection('employee').updateOne(
            { _id: new ObjectId(employeeId) }, // Filter by employee ID
            { $set: {
                name: req.body.name,
                date: formatDate(req.body.joiningDate),
                day: req.body.weekday,
                salary: req.body.salary
            }}
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        return res.json({ Status: 'Success' });
    } catch (error) {
        console.error('Error updating employee:', error);
        return res.status(500).json({ error: 'Error updating employee' });
    }
});

app.delete('/delete/:id', async (req, res) => {
    const employeeId = req.params.id;
    
    try {
        const result = await db.collection('employee').deleteOne({ _id: new ObjectId(employeeId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        return res.json({ Status: 'Success' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({ error: 'Error deleting employee' });
    }
});






//sizes api

app.get('/getSizes' , async(req,res) =>{
    try {
        const result = await db.collection('sizes').find().toArray();
        return res.json({ status: 'Success', Result: result });
    } catch (error) {
        console.error('Error retrieving sizes:', error);
        return  res.status(500).json({ error: 'Could not retrieve employees' });
    }
})


app.post('/addsize', async (req, res) => {
    try {
        const result = await db.collection('sizes').insertOne({
            sizeno: req.body.sizeno,
            sizecode: req.body.sizecode
        });

        if (result.insertedCount === 1) {
            return res.json({ Status: "Size entry added successfully" });
        } else {
            return res.json({ Error: "Error adding size entry" });
        }
    } catch (error) {
        console.error('Error adding size entry:', error);
        return res.status(500).json({ Error: "Error adding size entry" });
    }
});


app.put('/updateSizeEntry/:id', async (req, res) => {
    try {
        const result = await db.collection('sizes').updateOne(
            { _id: new ObjectId(req.params.id) }, // Filter by size entry ID
            { $set: {
                sizeno: req.body.sizeno,
                sizecode: req.body.sizecode
            }}
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Size entry not found' });
        }

        return res.json({ success: true, message: 'Size entry updated successfully' });
    } catch (error) {
        console.error('Error updating size entry:', error);
        return res.status(500).json({ error: 'Error updating size entry' });
    }
});


app.delete('/deleteSizeEntry/:id', async (req, res) => {
    try {
        const result = await db.collection('sizes').deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Size entry not found' });
        }

        return res.json({ Status: 'Success' });
    } catch (error) {
        console.error('Error deleting size entry:', error);
        return res.status(500).json({ error: 'Error deleting size entry' });
    }
});

app.get('/getSalary/:id', async (req, res) => {
    const employeeId = req.params.id;

    try {
        const result = await db.collection('employee').findOne({ _id: new ObjectId(employeeId) });

        if (!result) {
            return res.json({ Error: 'Employee not found' });
        }

        const salary = result.salary;
        return res.json({ Salary: salary });
    } catch (error) {
        console.error('Error getting employee details:', error);
        return res.status(500).json({ Error: 'Error getting employee details' });
    }
});



//attendance apis

app.get('/getAttendance/:id', async (req, res) => {
    const employeeId = req.params.id;
    const { month, year } = req.query;

    try {
        const result = await db.collection('attendance').find({
            employee_id: employeeId,
            month: month,
            year: year
        }).toArray();

        return res.json({ Result: result });
    } catch (error) {
        console.error('Error getting attendance:', error);
        return res.status(500).json({ error: 'Error getting attendance' });
    }
});


app.get('/getDayAttendance/:id/:year/:month/:day', async (req, res) => {
    const { id, year, month, day } = req.params;

    try {
        const result = await db.collection('attendance').find({
            employee_id: id,
            year:(year),
            month: (month),
            day: parseInt(day)
        }).toArray();

        return res.json({ Result: result });
    } catch (error) {
        console.error('Error getting day-wise attendance:', error);
        return res.status(500).json({ error: 'Error getting day-wise attendance details' });
    }
});


app.post('/submitAttendance/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { month, day, year, status } = req.body;

        const result = await db.collection('attendance').insertOne({
            employee_id: id,
            month: month,
            day: day,
            year: year,
            status: status
        });

        return res.json({ Status: 'Success' });
    } catch (error) {
        console.error('Error adding attendance:', error);
        return res.status(500).json({ Error: 'Error in adding attendance' });
    }
});


app.put('/updateAttendance/:id/:day/:month/:year', async (req, res) => {
    try {
        const { id, day, month, year } = req.params;
        const { status } = req.body;

        const result = await db.collection('attendance').updateOne(
            { 
                employee_id: id, 
                day: parseInt(day), 
                month: (month), 
                year: (year) 
            },
            { $set: { status: status } }
        );

        if (result.modifiedCount !== 1) {
            throw new Error('Failed to update attendance');
        }

        return res.json({ success: true, message: "Attendance updated successfully" });
    } catch (error) {
        console.error('Error updating attendance:', error);
        return res.status(500).json({ error: "Error updating attendance" });
    }
});




//progress apis


app.post('/submitProgress/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { month, day, year, quantity, sizeno, value, packed } = req.body;

        const result = await db.collection('progress').insertOne({
            emp_id: id,
            month: month,
            day: day,
            year: year,
            quantity: quantity,
            sizeno: sizeno,
            value: value,
            packed: packed
        });

        if (result.insertedCount === 1) {
            return res.json({ Status: "Progress added successfully" });
        } else {
            return res.json({ Error: "Error adding progress entry" });
        }    } 
        catch (error) {
        console.error('Error adding progress:', error);
        return res.status(500).json({ Error: 'Error in adding progress' });
    }
});





app.get('/getProgress/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year } = req.query;

        const result = await db.collection('progress').find({
            emp_id: id,
            month: month,
            year: year
        }).toArray();

        return res.json({ Result: result });
    } catch (error) {
        console.error('Error getting progress:', error);
        return res.status(500).json({ Error: 'Error getting progress details' });
    }
});


app.get('/getDayProgress/:id/:day/:month/:year', async (req, res) => {
    try {
        const { id, day, month, year } = req.params;

        const result = await db.collection('progress').find({
            emp_id: id,
            day: parseInt(day),
            month: month,
            year: year
        }).toArray();

        return res.json({ Result: result });
    } catch (error) {
        console.error('Error getting day-wise progress:', error);
        return res.status(500).json({ Error: 'Error getting day-wise progress details' });
    }
});


app.put('/updateProgress/:emp_id/:id', async (req, res) => {
    try {
        const { emp_id, id } = req.params;
        const { quantity, sizeno, value, packed } = req.body;

        const result = await db.collection('progress').updateOne(
            { emp_id: emp_id, _id: new ObjectId(id) },
            { $set: { quantity: quantity, sizeno: sizeno, value: value, packed: packed } }
        );

        console.log("Resultt    ",result);
        return res.json({ success: true, message: "Progress updated successfully" });

    } catch (error) {
        console.error('Error updating progress:', error);
        return res.status(500).json({ error: "Error updating progress" });
    }
});

app.delete('/deleteProgress/:emp_id/:id', async (req, res) => {
    try {
        const emp_id = req.params.emp_id;
        const id = req.params.id;

        const result = await db.collection('progress').deleteOne({
            emp_id: emp_id,
            _id: new ObjectId(id) 
        });

        console.log("Result: ", result);

        if (result.deletedCount === 0) {
            return res.json({ Error: "Progress not found" });
        }

        return res.json({ Status: "Success" });
    } catch (error) {
        console.error('Error deleting progress:', error);
        return res.status(500).json({ Error: "Delete progress error in MongoDB" });
    }
});



//packing apis

app.get('/getPacking/:packed', async (req, res) => {
    try {
        const { packed } = req.params;
        const { month, year } = req.query;

        const result = await db.collection('progress').find({
            packed: packed,
            month: month,
            year: year
        }).toArray();
        

        return res.json({ Result: result });
    } catch (error) {
        console.error('Error getting packing details:', error);
        return res.status(500).json({ Error: 'Error getting packing details' });
    }
});


app.get('/getDayPacking/:packed/:day/:month/:year', async (req, res) => {
    try {
        const { packed, day, month, year } = req.params;

        const result = await db.collection('progress').find({
            packed: packed,
            day: parseInt(day), // Convert day to a number if needed
            month: month,
            year: year
        }).toArray();

        return res.json({ Result: result });
    } catch (error) {
        console.error('Error getting packing details:', error);
        return res.status(500).json({ Error: 'Error getting packing details' });
    }
});





//user api

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.collection('users').findOne({ email: email, password: password });

        if (user) {
            return res.json({ Status: "Success" });
        } else {
            return res.json({ Status: "Error", Error: "Wrong Email or Password" });
        }
    } catch (error) {
        console.error('Error in running query:', error);
        return res.status(500).json({ Status: "Error", Error: "Error in Running Query" });
    }
});




function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}





