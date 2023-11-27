import { interval, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, concatMap } from 'rxjs/operators';

export default class Polling {
  constructor(container) {
    this.container = container;
  }

  init() {
    this.bindToDom();
    this.newMessagesSubscribe();
    this.showMessageText();
  }

  bindToDom() {
    this.messageField = this.container.querySelector('.message-field');
  }


  newMessagesSubscribe() {
    const interval$ = interval(10000);
    
    this.subscription = interval$.pipe(
      concatMap(() => ajax.getJSON('https://polling-be.onrender.com/messages/unread')),
      catchError(() => of({ messages: [] })),
    ).subscribe((response) => {
      if (response.status !== 'ok') return;

      response.messages.forEach((message) => {
        this.renderMessage(message);
      });
    });
  }

  renderMessage({
    id, from, subject, received, body,
  }) {
    
    const message = document.createElement('div');
    let messageSubject;
    const formattedDate = new Date(received).toLocaleString('ru-RU');
    
    if(subject.length > 15) {
      messageSubject = `${subject.slice(0, 14)}...`;
    } else {
      messageSubject = subject;
    }
    
    message.classList.add('message');
    message.id = id;
    message.innerHTML = `
      <div class="message-header">
        <p class="message-email">${from}</p>
        <p class="message-subject">${messageSubject}</p>
        <span class="message-date">${formattedDate}</span>
      </div>
      <div class="message-footer">
        <p class="message-text">${body}</p>
      </div>
    `;

    this.messageField.prepend(message);
  }

  showMessageText() {
    this.messageField.addEventListener('click', (e) => {
      let message = e.target.closest('.message');
      let messageFooter = message.querySelector('.message-footer');
      
      messageFooter.classList.toggle('opening');
    })
  }
}