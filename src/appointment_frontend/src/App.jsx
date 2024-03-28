import { useState,useEffect } from 'react';
import { appointment_backend } from 'declarations/appointment_backend';
import React from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Formik, useFormik } from 'formik';
import { Flex, Box, Heading, FormControl, FormLabel, Input, Button, Alert,useToast} from "@chakra-ui/react";
import validations from './validations';
import emailvalidation from './emailvalidation';
function App() {
  const [num, setNum] = useState(-1)
  const data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
  const [value, setValue] = useState(new Date());
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
  },[value])

  function ReservedHours(data){
    var sec = [];
    data[0]?.map(item => {
      sec.push(item["hour"])
    })
    setSelected(sec);
  }
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
    validationSchema:validations,
    
    onSubmit: (values, bag) => {
      try {
        let model = {
          name:values.name,
          mail:values.email,
          month:value.getMonth()+1,
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
            addToast("error","There is a reservation for this email!");
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

  const checkRezervationFormik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema:emailvalidation,
    onSubmit: (values, bag) => {
      try {
       
        appointment_backend.get_appointment_by_mail(values.email).then((appoints) => {
          console.log("gonderim sonucu",appoints);
          if(appoints.length >0){
            addToast("success",`Reserved for ${appoints[0]["day"]}/${appoints[0]["month"]}/2024 at ${appoints[0]["hour"]}:00`);

          }
          else{
            addToast("error","No reservations found!!!");
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
     <div >
     <Flex align='center' width='350px'  float='left' ml='150px' mt={100}>
        <Box>
        <Box Box textAlign='center'  mb='5'>
            <Heading>Check My Status</Heading>
        </Box>
        <Box my={5} textAlign='left' >
            <form onSubmit={checkRezervationFormik.handleSubmit}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input name='email' onChange={checkRezervationFormik.handleChange} onBlur={checkRezervationFormik.handleBlur}
                  type='email'
                  value={checkRezervationFormik.values.email}
                  isInvalid={checkRezervationFormik.touched.email && checkRezervationFormik.errors.email}
                ></Input>
              </FormControl>
              <Button type='submit' mt='4' width='full' colorScheme='orange'>Check Reservation</Button>
            </form>
          </Box>
        </Box>
      </Flex> 

     <Flex align='center' width='350px' justifyContent='end' mr='350px'  float='right'>
        <Box pt='5'>
          <Box textAlign='center'>
            <Heading>Create Appointment</Heading>
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
                  type='email'
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
              <Button type='submit' mt='4' width='full' colorScheme='green'>Create</Button>
            </form>
          </Box>
        </Box>
      </Flex>  

       
     </div>
      
     
       </>
  );
}

export default App;


//npm i react-calendar
//npm install formik
//npm i @chakra-ui/react @emotion/react @emotion/styled framer-motion
// npm i formik yup
