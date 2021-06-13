import 'bootstrap/dist/css/bootstrap.min.css';
import Jumbotron from 'react-bootstrap/Jumbotron'
import Button from 'react-bootstrap/Button'
import React, { useState } from 'react';
import ipfs from "./ipfs"
import Buffer from "./buffer"
import { ABI, IPFS_CONTRACT_ADDRESS } from './ipfscontract'
import Web3 from 'web3';

function App() {
  const [file, setFile] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [fileName, setFileName] = useState("");
  const [retrievedFile, setRetrievedFile] = useState("");

  const handleChange = (event) =>{
    event.preventDefault();
    setFile(event.target.files[0])
  }

  const handleRetrieveChange = (event) =>{
    event.preventDefault();
    setFileName(event.target.value)
  }
  const saveToIpfs = (reader) => {
    const buffer = Buffer.from(reader.result)
    console.log(buffer)
    ipfs.add(buffer)
    .then((response) => {
      const ipfsId = response.path
      setFileHash(ipfsId)
    }).catch((err) => {
      console.error(err)
    })
  }


  const handleSubmit =  async (event) =>{
    event.preventDefault();
    const web3 = new Web3(Web3.givenProvider);
    const IPFSContract = new web3.eth.Contract(ABI, IPFS_CONTRACT_ADDRESS);
    const accounts = await window.ethereum.enable();
    const account = accounts[0]

    let reader = new window.FileReader()
    reader.onloadend = () => saveToIpfs(reader)
    reader.readAsArrayBuffer(file)

    //save file name and hash to smart contract
    await IPFSContract.methods.storeHash(file.name, fileHash).call()

  }

  const handleRetrieveSubmit =  async (event) =>{
    event.preventDefault();
    const web3 = new Web3(Web3.givenProvider);
    const IPFSContract = new web3.eth.Contract(ABI, IPFS_CONTRACT_ADDRESS);
    const accounts = await window.ethereum.enable();
    const account = accounts[0]

    let reader = new window.FileReader()

    //get hash from smart contract
    let hash = await IPFSContract.methods.getHash(fileName).call()

    for await (const file of ipfs.get(hash)) {
      if (!file.content) continue;
      const content = []
      for await (const chunk of file.content) {
        content.push(chunk)
      }
      
      setRetrievedFile(content[0])
    }
    // write  buffer to file
  
  }
  return (
    <>
    <Jumbotron>
       <h1>Upload file</h1>
       <form >
       <p>
         <input  type="file" onChange={handleChange} required/>
       </p>
       <p>
         <Button variant="primary" onClick={handleSubmit}>Submit file</Button>
       </p>
       </form>


       <h1>Retrieve file</h1>
       <form >
       <p>
         <input  placeholder="Enter File Name" onChange={handleRetrieveChange} required/>
       </p>
       <p>
         <Button variant="primary" onClick={handleRetrieveSubmit}>Submit</Button>
       </p>
       </form>
     </Jumbotron>
   </>
   
  );
}

export default App;
