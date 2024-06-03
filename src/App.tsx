import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function App() {
  const { data } = useQuery({
    queryKey: ["/users"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:3000/users");
      return response.data;
    },
  });
  const { data: productData, refetch } = useQuery({
    queryKey: ["/products"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:3000/products");
      return response.data;
    },
    enabled: false,
  });

  console.log(data);
  console.log(productData);

  const handleClick = () => {
    refetch();
  };
  return (
    <>
      <div>sdsdsdsd</div>
      <button onClick={handleClick}>데이터 갖고오기</button>
    </>
  );
}

export default App;
