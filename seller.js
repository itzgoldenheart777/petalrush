async function addFlower(){

const name =
document.getElementById("name").value;

const price =
document.getElementById("price").value;

const seller =
localStorage.getItem("user");

await client.from("flowers")
.insert([
{
name,
price,
seller_email:seller
}
]);

alert("Flower added");

}