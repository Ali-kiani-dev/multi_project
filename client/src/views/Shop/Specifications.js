import React, { useState , useEffect, useContext} from 'react';
import {  Card, CardBody, CardHeader, Col, Row, Table,Button,Label,Input,FormGroup,CardFooter,Spinner  } from 'reactstrap';
import classes from './scoring.module.css';
import {AuthContext} from '../../context/Auth/AuthContext';
import GetToken from '../../context/Auth/GetToken';
import axios from 'axios'
const Specifications=(props)=> {
  const [allCategory,setAllCategory] = useState([]);
  const [subCategory,setSubCategory] = useState([]);
  const[subCategoryId,setSubCategoryId] = useState(null);
  const [mainCategory,setMainCategory] = useState(true);
  const [parentCategory,setParentCategory] = useState(false);
  const [message,setMessage] = useState('');
  const [title,setTitle] = useState('');
  const[description,setDescription] = useState('');
  const [loading,setLoadnig] = useState(false);
  const [allProductSpecs,setAllProductSpecs] = useState([]);
  const {dispatch} = useContext(AuthContext);
  const token =  GetToken();
  const[ID,setID] = useState(null);
  useEffect(()=>{
    dispatch({type:'check',payload:props});
    axios({
        url: '/',
        method: 'post',
        headers:{'token':`${token}`},
        data: {
          query: `
          query getAllCategory($page : Int, $limit : Int, $mainCategory : Boolean, $parentCategory : Boolean, $catId : ID) {
            getAllCategory(input : {page : $page, limit : $limit, mainCategory : $mainCategory, parentCategory : $parentCategory, catId : $catId}) {
              _id,
              name,
            }
          }      
            `,
            variables :{
                "page": 1,
                "limit": 30,
                "mainCategory": mainCategory,
                "parentCategory": parentCategory,
                "catId": subCategoryId
            }
      }
    }).then((result) => {
        const {getAllCategory} = result.data.data;
        if(result.data.errors){
            setMessage('خطا در دریافت اطلاعات')
          }
       else if(mainCategory){
            setAllCategory(getAllCategory);
        }
        else if(parentCategory){
            setSubCategory(getAllCategory);
        }
        
    }).catch(error=>{
      console.log(error)
    });
},[subCategoryId])
  const getSubCategory =(event)=>{
    setSubCategoryId(event.target.value);
    setMainCategory(false);
    setParentCategory(true);
    
    }

    const getId=(event)=>{
      setID(event.target.value);
      setLoadnig(true);
      axios({
        url: '/',
        method: 'post',
        headers:{'token':`${token}`},
        data: {
          query: `
          query getAllProductSpecs ($categoryId : ID!) {
            getAllProductSpecs(categoryId : $categoryId) {
              specs,
              label,
              _id
            }
          }   
            `,
            variables :{
              "categoryId": event.target.value
            }
      }
      }).then((result) => {
        if(result.data.errors){
          setMessage('خطا در دریافت اطلاعات')
        }
        setAllProductSpecs(result.data.data.getAllProductSpecs);
        setLoadnig(false);
      }).catch(error=>{
        console.log(error)
      });
    }

  const titleHandler=(event)=>{
    setTitle(event.target.value);
  }

  const descriptionHandler = (event) =>{
    setDescription(event.target.value);
  }

  const formHandler = ()=>{
    axios({
      url: '/',
      method: 'post',
      headers:{'token':`${token}`},
      data: {
        query: `
        mutation addProductSpecs ($category : ID!, $specs : String!, $label : String){
          productSpecs(input : {category : $category, specs : $specs, label : $label}) {
            status,
            message,
            _id
          }
        }    
          `,
          variables :{
            "category": ID,
            "specs": title,
            "label": description
          }
    }
    }).then((result) => {
      if(result.data.errors){
        setMessage('خطا در دریافت اطلاعات')
      }
      else{
        setMessage(result.data.data.productSpecs.message);
        const arrayHolder = [...allProductSpecs];
        arrayHolder.push({
          _id:result.data.data.productSpecs._id,
          specs: title,
          label: description
        });
        setAllProductSpecs(arrayHolder);
        setTitle('');
        setDescription('');
      }

    }).catch(error=>{
      console.log(error)
    });
  }
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12} xs={12} md={12}>
              <Card>
                <CardHeader>         
                    <strong> مشخصات </strong>
                    <br />
                    <span style={{color:'red'}}>{message}</span>
                </CardHeader>
                <CardBody>
                <FormGroup row className="my-0">
                      <Col xs="3">
                        <FormGroup>
                            <Label htmlFor="subcategory">دسته اصلی</Label>
                            <Input type="select" name="subcategory" id="subcategory" onChange={getSubCategory}>
                                <option ></option>
                                {
                                    allCategory.map((item)=><option key={item._id} value={item._id}>{item.name}</option>)
                                }
                                
                            </Input>
                            </FormGroup>
                      </Col>
                      <Col xs="3">
                        <FormGroup>
                            <Label htmlFor="subcategory">زیر دسته</Label>
                            <Input type="select" name="subcategory" id="subcategory" onChange={getId}>
                                <option ></option>
                                {
                                    subCategory.map((item)=><option key={item._id} value={item._id}>{item.name}</option>)
                                }
                                
                                
                            </Input>
                            </FormGroup>
                      </Col>
                      <Col xs="3">
                          <FormGroup>
                              <Label htmlFor="subcategory">عنوان</Label>
                              <Input type="text" name="disabled-input" placeholder="عنوان اصلی مشخصات" value={title} onChange={titleHandler}  />
                          </FormGroup>
                      </Col>  
                      <Col xs="3">
                          <FormGroup>
                              <Label htmlFor="subcategory">توضیحات</Label>
                              <Input type="text" name="disabled-input" placeholder="توضیحات" value={description} onChange={descriptionHandler}  />
                          </FormGroup>
                      </Col>
                  </FormGroup>
                </CardBody>
                <CardFooter>
                <Button type="submit" size="sm" color="primary" onClick={formHandler}><strong>ثبت</strong> </Button>
              </CardFooter>
              </Card>
              <Card>
                <CardHeader>                   
                        <strong>لیست دسته بندی ها</strong>
                </CardHeader>
                <CardBody>
                  {
                    loading ? 
                    <center><Spinner animation="grow" /></center>
                     :
                    <Table responsive >
                    <thead>
                    <tr>
                        
                        <th>عنوان</th>
                        <th>توضیحات</th>
                        <th>عملیات</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                      {
                        allProductSpecs.map((item)=>
                        <tr key={item._id}>
                          <td>{item.specs}</td>
                          <td>{item.label} </td>
                          
                          <td>          
                            <Button type="submit" size="sm" color="primary" className="btn-pill"
                            >
                              ویرایش
                            </Button>  
                            <Button type="submit" size="sm" color="danger" className="btn-pill"
                            >
                              حذف
                            </Button>  
                            
                          </td>  
                                                
                       </tr> 
                        )
                      }
                        
                     
                                                                        
                    </tbody>
                </Table>
                  }
                   
                    
                </CardBody>
              </Card>
          </Col>
        </Row>
      </div>
    )
  
}

export default Specifications;
