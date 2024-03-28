import { useState,useEffect } from 'react';
import { appointment_backend } from 'declarations/appointment_backend';
import React from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Formik, useFormik } from 'formik';
import { Flex, Box, Heading, FormControl, FormLabel, Input, Button, Alert, AlertIcon,AlertTitle,AlertDescription,useToast} from "@chakra-ui/react";

function App() {
  const [num, setNum] = useState(-1)
  const data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
  const [value, setValue] = useState(new Date());
  const [showHours,setShowHours] = useState(false);
  const [selected,setSelected] = useState([]);
  function onChange(nextValue){
    setValue(nextValue);
  }
  const[veri,setVeri] = useState(null);
  
  useEffect(() => {
    appointment_backend.get_appointment_list_by_day(value.getDate())
          .then(data => ReservedHours(data))
          .then(data => setVeri(data))
          .catch(err => console.error("Custom err: ", err));
    console.log("selected",selected);
  },[value])

  function ReservedHours(data){
    var sec = [];
    console.log("ReservedHoursa girdi",data[0]);
    data[0]?.map(item => {
      console.log(item["hour"])
      sec.push(item["hour"])
    })
    setSelected(sec);
  }
  console.log("selected hours",selected);
  console.log("value",value);
  console.log("value.getdate",value.getDate());
  function onChange(nextValue){
    setValue(nextValue);
  }

  const toast = useToast();
  const toastIdRef = React.useRef();
  function addToast(result,message) {
    toastIdRef.current = toast({ description:result ,colorScheme:result=='success' ? 'green':'red',  status:result,title:message})
  }
  //make an appointmenT
  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
    },
    
    onSubmit: (values, bag) => {
      try {
        let model = {
          name:values.name,
          mail:values.email,
          day:value.getDate(),
          hour:num
        };
        if(model.day < 0 || model.hour <0){
          addToast("error","Please select date and hour!!");
            var timer = setTimeout(function () {

            }, 5000);
        }
        appointment_backend.create_appointment(model).then((data) => {
          console.log("gonderim sonucu",data);
         
          if(data ==true){
            addToast("success","Appointment is scheduled");
            var timer = setTimeout(function () {

            }, 5000);
            setSelected([...selected,num]);
          }
          else{
            addToast("error","An error is occurred");
             ResponseMessage("error");
          }
        });
      }
      catch (error) {
        ResponseMessage("error");
        console.log("an error occurred!!!");
      }
    }
  })
  function ResponseMessage(response) {
    const toast = useToast()
    // Function to show the toast
    const showToast = () => {
      toast({
          title: "Action successful",
          description: "Your changes have been saved.",
          status: {response},
          duration: 5000,
          isClosable: true,
          position: "top"
      });
  };

  return (
      <div style={{ padding: 20 }}>
          <Button colorScheme="blue" onClick={showToast}>
              Show Toast
          </Button>
      </div>
  );
  }
  
  return (
    <>
    <div className='container clearfix'>
      <div>
      <Calendar
          onChange={onChange}
          value={value}
          onClickDay={() => setShowHours(true)}
      />
      </div>
      <div>{
         <div className='buttons'>
        {data.map(number => (
          <button 
          className={`${selected.includes(number) ? 'inactive' : 'active'}  ${number==num ? 'selected-button': ''}`} 
          key={number}
          onClick={() => setNum(number)}
          >{number}:00</button>
        ))}
        </div>
      }</div>
    </div>
<Flex align='center' width='full' justifyContent='center'>
        <Box pt='10'>
          <Box textAlign='center'>
            <Heading>Make an Appointment</Heading>
          </Box>
          <Box my='5'>
            {formik.errors.general && (
              <Alert status='error'>{formik.errors.general}</Alert>
            )}
          </Box>
          <Box my={5} textAlign='left' >
            <form onSubmit={formik.handleSubmit}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input name='email' onChange={formik.handleChange} onBlur={formik.handleBlur}
                  value={formik.values.email}
                  isInvalid={formik.touched.email && formik.errors.email}
                ></Input>
              </FormControl>

              <FormControl mt='4'>
                <FormLabel>Name</FormLabel>
                <Input name='name' onChange={formik.handleChange} onBlur={formik.handleBlur}
                  value={formik.values.name}
                  isInvalid={formik.touched.name && formik.errors.name}

                ></Input>
              </FormControl>
              <Button type='submit' mt='4' width='full'>Create</Button>
            </form>
          </Box>
        </Box>
      </Flex>    </>
  );
}

export default App;


//npm i react-calendar
//npm install formik
//npm i @chakra-ui/react @emotion/react @emotion/styled framer-motion