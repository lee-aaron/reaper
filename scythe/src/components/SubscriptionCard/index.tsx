import { Container } from '@mui/material';
import React, { useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  amount: number;
  description: string;
}

const SubscriptionCard: React.FC<{}> = () => {

  const [subscription, setSubscriptions] = React.useState<Array<Product>>([]);

  useEffect(() => {
    let query = {
      email: "lee.aaron.68@gmail.com"
    }

    let url = new URL("http://localhost:3000/api/v1/search_product")
    let params = {
      "query": JSON.stringify(query)
    }
    url.search = new URLSearchParams(params).toString()

    fetch(url).then(res => res.json()).then(res => {
      setSubscriptions(res);
    }).catch(e => console.error(e));
  }, []);

  return (
    <React.Fragment>
      <Container>
        {
          subscription.map(sub => {
            return <div key={sub.id}>{sub.name} - {sub.description} - {sub.amount}</div>
          })
        }
      </Container>
    </React.Fragment>
  )
}

export default SubscriptionCard;