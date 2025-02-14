import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  constructor(private http: HttpClient) { }

  getResponse(user:string){
    return this.http.post<{msg:String | Array<any> }>('http://localhost:7700/api/book/chatbot',{user:user});
  }
}
