import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  constructor(private http: HttpClient) { }

  getResponse(user:string){
    return this.http.post<{msg:String | Array<any> }>('https://book-backend-uz4g.onrender.com/api/book/chatbot',{user:user});
  }
}
