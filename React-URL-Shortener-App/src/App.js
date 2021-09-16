import './App.css';
import React from 'react';
import axios from 'axios';
import copy from "copy-to-clipboard";
import * as xlsx from "xlsx";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      longUrl: [],
      shortUrl: '',
      urlList: [
        {
          longUrl: '',
          shortUrl: '',
          valid: ''
        }
      ],
      items: []
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.copyText = this.copyText.bind(this);
    this.readExcelData = this.readExcelData.bind(this);
  }

  handleSubmit = async (event) => {
    console.log(this.state)
    if (this.state.longUrl[0] && this.state.longUrl[0].includes('http://localhost:5000')) {
      alert('Invalid Url')
      return
    }
    if (this.state.longUrl.length) {
      axios.post('http://localhost:5000/api/url/shorten', {
        longUrl: this.state.longUrl
      })
        .then((res) => {
          console.log(res)
          let urlListData = [];
          if (res.data.length > 1) {
            res.data.map((responseData) => {
              urlListData.push({
                longUrl: responseData.longUrl,
                shortUrl: responseData.shortUrl,
                valid: responseData.valid,
              })
            })
          } else {
            urlListData.push({
              longUrl: res.data[0].longUrl,
              shortUrl: res.data[0].shortUrl,
              valid: res.data[0].valid,
            })
          }

          console.log(res.data[0].shortUrl)
          this.setState({
            longUrl: [],
            shortUrl: res.data.length > 1 ? this.state.shortUrl : res.data[0].shortUrl,
            urlList: this.state.urlList.concat(urlListData)

          })
          console.log(this.state.urlList)
        })
        .catch((error) => {
          console.log(error)
          alert(error)
        })
    }
    else {
      alert('Url required!')
    }
    event.preventDefault();
  }


  handleChange = (event) => {
    this.setState({ longUrl: [event.target.value] })
  }
  copyText = (event) => {
    copy(this.state.shortUrl);
    event.preventDefault();
  }


  readExcelData = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (event) => {
        const bufferArray = event.target.result;
        const wb = xlsx.read(bufferArray, { type: "buffer" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = xlsx.utils.sheet_to_json(ws);
        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    })
      .then((urlData) => {
        let urlItems = []
        urlData.map((data) => {
          urlItems.push(data.url)
        })
        this.setState({
          longUrl: urlItems
        })
        return this.state.longUrl;
      });
  };

  render() {
    const urlList = this.state.urlList.map((url, index) => {
      return (
        <tr>
          <td>{url.longUrl}</td>
          <td>{url.shortUrl}</td>
          <td>{url.valid.toString()}</td>
        </tr>
      )
    })
    const urlHeader = urlList.length>1 ? 
        <tr>
          <th>Long URL</th>
          <th>Short URL</th>
          <th>Valid URL</th>
        </tr>
        : ''
    

    return (
      <div className="App" >
        <div className="Header"> URL Shortener</div>
        <header className="App-header">
          <form className="form-style" onSubmit={this.handleSubmit}>
            <div>
              <div className="text-align">
                <textarea className="Textbox" placeholder="Shorten your URL" onChange={this.handleChange} value={this.state.longUrl}>
                </textarea>

                <input type="submit" className="shorten-button" value="Shorten" />

              </div>
              <div className="text-align">
                <textarea className="Textbox" placeholder="Shorten URL" value={this.state.shortUrl} disabled>
                </textarea>
                <button className="copy-button" onClick={this.copyText}>
                  Copy
                </button>

              </div>
              <div className="text-align">
                <label className="label-style">Choose excel file to short bulk URL</label>
                <input
                  className="file-button"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files[0];
                    this.readExcelData(file).then(data => this.handleSubmit())
                      .catch(error => console.log(error))
                    event.preventDefault();
                  }}
                />
              </div>
              <div className="text-align">
                <table className="table-style" >
                  {urlHeader}
                  {urlList}
                </table >
              </div>
            </div>
          </form>
        </header>
      </div >
    );
  }
}

export default App;
