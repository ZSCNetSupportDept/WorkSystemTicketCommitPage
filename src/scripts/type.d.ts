/// <reference types="jquery"/>
/// <reference types="bootstrap"/>

type URLName = "is_login" | "logout" | "login" | "work_order_add";

declare var ejs: {
	compile(template: string): Function;
};
declare var global: {
	app: {
		
	}
};

type APIUser = { job: string, ID: string, work_phone: string, workPlace: string, name: string, workDay: number };
type APIWorker = { work_number: string, person_phone: string, work_phone: string, area: string, name: string, person_phone: number };

type APIResponseStatus = {
	work_orders: { telecom: number, complaints: number, mobile: number, unicom: number };
	user: APIUser;
	works: APIWorker[];
	check: boolean;
	is_login: boolean;
	error?: string;
	csrf_token: string;
	announcement: string;
	success: string;
	place: string;
};

type APIRequestCommitTicket = {
	situation_order: number;
	situation_order_string: string;

	work_area: string;
	introduction: string;
	
	account_number: string;
	telephone_number: string; 
	more_phone_number: string[];
	
	operator:string;
	dormitory_number: string; 

	status: number;
}