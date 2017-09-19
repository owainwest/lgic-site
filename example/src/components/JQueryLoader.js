import React, { Component } from 'react';

class JQueryLoader extends Component {
  render() {
    return (
      <div className="scripContainer">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"/>
        <script src="js/captcha/jquery.clientsidecaptcha.js" type="text/javascript"></script>
      </div>
    );
  }
}

export{JQueryLoader};