import React,{useEffect, useState, useContext} from 'react';
import {
    Card,
    CardBody,
    Col,
    Spinner
} from 'reactstrap';
import { Line } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle } from '@coreui/coreui/dist/js/coreui-utilities';
import {AuthContext} from '../../context/Auth/AuthContext';
import GetToken from '../../context/Auth/GetToken';
import axios from 'axios';
const brandPrimary = getStyle('--primary')


  
  const cardChartOpts = {
    tooltips: {
      enabled: false,
      custom: CustomTooltips
    },
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    scales: {
      xAxes: [
        {
          gridLines: {
            color: 'transparent',
            zeroLineColor: 'transparent',
          },
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
  
        }],
      yAxes: [
        {
          display: false,
          ticks: {
            display: false,
          },
        }],
    },
    elements: {
      line: {
        borderWidth: 1,
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 4,
      },
    }
  }
const NumberProducts = (props)=>{
  const {dispatch} = useContext(AuthContext);
  const token =  GetToken();
  const [sum,setSum] = useState(0);
  const [chartData,setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'محصول',
        backgroundColor: brandPrimary,
        borderColor: 'rgba(255,255,255,.55)',
        data: [],
      },
    ],
  }
  
)
  useEffect(()=>{
    dispatch({type:'check',payload:props});
    axios({
      url: '/',
      method: 'post',
      headers:{'token':`${token}`},
      data: {
        query: `
        query productAtmonth {
          productAtmonth {
            month,
            value
          }
        }
          `
    }
  }).then((result) => {
    if(result.data.errors){
      //dispatch({type:'logout',payload:props});
      console.log(result.data.errors)
    }
    else{
      const {productAtmonth  } = result.data.data;
      const arrayHolder = {...chartData};
      let sum =0;
      productAtmonth.map(item=>{
        sum += item.value;
        arrayHolder.labels.push(item.month);
        arrayHolder.datasets[0].data.push(item.value)
      })
      setSum(sum)
      setChartData(arrayHolder);
    }
   
  }).catch(error=>{
     console.log(error)
  });

  },[])
    return(
        
        <Col xs="12" sm="6" lg="4">
            <Card className="text-white bg-primary">
              <CardBody className="pb-0">
                
                <div className="text-value">{sum !==0?sum:null}</div>
                <div> تعداد محصولات</div>
              </CardBody>
              <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
              {chartData.labels.length !==0 ?<Line data={chartData} options={cardChartOpts} height={70} /> : <Spinner />}
              </div>
            </Card>
          </Col>
    )
}
export default React.memo(NumberProducts)