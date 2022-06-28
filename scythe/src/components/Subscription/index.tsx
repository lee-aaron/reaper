import { Container } from '@mui/material';
import React, { useEffect } from 'react';
import { useUser } from '../../state/discord/hooks';
import SubscriptionItem from './SubscriptionItem';

export interface Product {
  id: string;
  name: string;
  amount: number;
  description: string;
  metadata: Map<string, string>;
}

const SubscriptionCard: React.FC<{}> = () => {

  const [subscription, setSubscriptions] = React.useState<Array<Product>>([]);
  const user = useUser();

  useEffect(() => {
    if (!user.id || !user.email) return;

    let query = {
      email: user.email
    }

    let url = new URL("/api/v1/search_product", window.location.origin);
    let params = {
      "query": JSON.stringify(query),
      "discord_id": user.id,
    }
    url.search = new URLSearchParams(params).toString()

    fetch(url).then(res => res.json()).then(res => {
      let prods = res.map((r: any) => {
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          amount: r.amount,
          metadata: new Map(Object.entries(r.metadata))
        }
      })
      setSubscriptions(prods);
    }).catch(e => console.error(e));
  }, [user]);

  return (
    <React.Fragment>
      <Container>
        {
          subscription.map(sub => {
            return <SubscriptionItem key={sub.id} {...sub} />
          })
        }
      </Container>
    </React.Fragment>
  )
}

export default SubscriptionCard;