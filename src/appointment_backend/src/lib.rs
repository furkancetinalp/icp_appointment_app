use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{BoundedStorable, DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::Serialize;
use std::{borrow::Cow, cell::RefCell};
use uuid::Uuid;

#[derive(CandidType, Deserialize, Clone)]
#[derive(Default, Debug, PartialEq, Serialize)]
struct Appointment {
    name: String,
    mail: String,
    month:u8,
    day: u8,
    hour: u8,
}
type Memory = VirtualMemory<DefaultMemoryImpl>;
const MAX_VALUE_SIZE: u32 = 1000;


impl Storable for Appointment {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}
impl BoundedStorable for Appointment {
    const MAX_SIZE: u32 = MAX_VALUE_SIZE;
    const IS_FIXED_SIZE: bool = false;
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static APPOINTMENT_MAP: RefCell<StableBTreeMap<u64, Appointment, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );
}

//UPDATE
#[ic_cdk_macros::update]
fn create_appointment( appointment:Appointment) ->bool{
    let if_already_exists = get_appointment_by_mail(appointment.mail.clone());
    match if_already_exists {
        Some(data) => {
            return false;
        },
        None => {
            let len = APPOINTMENT_MAP.with(|p| p.borrow().len());
            let data = Appointment{
                name:appointment.name,
                mail:appointment.mail,
                day:appointment.day,
                hour:appointment.hour,
                month:appointment.month
            };
            APPOINTMENT_MAP.with(|p| p.borrow_mut().insert(len,data));
            return true;
        }
    }
 
}
#[ic_cdk_macros::update]
fn delete_appointment(mail:String) ->bool{
    let x  = APPOINTMENT_MAP.with(|p| p.borrow().iter().find(|x| x.1.mail==mail )).clone().unwrap();
    APPOINTMENT_MAP.with(|p| p.borrow_mut().remove(&x.0));
    return true;
}

//GET

#[ic_cdk_macros::query]
fn get_appointment_by_mail(mail:String) ->Option<Appointment>{
    if let Some(x) = APPOINTMENT_MAP.with(|p| p.borrow().iter().find(|x| x.1.mail==mail )).clone(){
        return Some(x.1);
    }
    else{
        return None;
    }

}



#[ic_cdk_macros::query]
fn get_all_appointments() -> Option<Vec<Appointment>>{
    let mut result: Vec<Appointment> = vec![];
    let s2: Vec<_> = APPOINTMENT_MAP.with(|p| p.borrow().iter().map(|x| x).collect());
    for item in s2.iter() {
       result.insert(result.len(),item.1.clone());
    }
    if result.len() > 0 {
        return Some(result);
    }
    None
}

#[ic_cdk_macros::query]
fn get_appointment_by_day_and_hour(day:u8,hour:u8) ->Option<Appointment>{
    let x:Option<(u64, Appointment)>  = APPOINTMENT_MAP.with(|p| p.borrow().iter().find(|x| x.1.day==day && x.1.hour==hour ));
    match x {
        Some(x) => {
            return Some(x.1);
        }
        None => {
            return None;
        }
    }
}

#[ic_cdk_macros::query]
fn get_appointment_list_by_day(day:u8) ->Option<Vec<Appointment>>{

    let request : Vec<_> = APPOINTMENT_MAP.with(|p| p.borrow().iter().filter(|x| x.1.day==day).collect::<Vec<_>>());
    let mut result: Vec<Appointment> = vec![];
    for item in request.iter() {
       result.insert(result.len(),item.1.clone());
    }
    if result.len() > 0 {
        return Some(result);
    }
    None
}