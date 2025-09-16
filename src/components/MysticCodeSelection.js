const MysticCodesComponent = () => {
//   const [mysticCodes, setMysticCodes] = useState([]);

//   useEffect(() => {
//     // Fetch mystic codes data from API
//     const fetchMysticCodes = async () => {
//       try {
//         const response = await axios.get('/api/mysticcodes');
//         setMysticCodes(response.data);
//       } catch (error) {
//         console.error('Error fetching mystic codes:', error);
//       }
//     };

//     fetchMysticCodes();
//   }, []);

//   return (
//     <div>
//       <Typography variant="h5">Mystic Codes</Typography>
//       <Grid container spacing={2}>
//         {mysticCodes.map((mysticCode) => (
//           <Grid item xs={12} sm={6} md={4} key={mysticCode._id}>
//             <Card>
//               <CardMedia
//                 component="img"
//                 alt={mysticCode.name}
//                 height="140"
//                 image={mysticCode.imageUrl}
//               />
//               <CardContent>
//                 <Typography variant="h6">{mysticCode.name}</Typography>
//                 <Typography variant="body2" color="textSecondary">
//                   {mysticCode.description}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </div>
//   );
};

export default MysticCodesComponent;
