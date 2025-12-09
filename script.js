let users = [];

const renderUserCard = (user) => {
  // Calculate age if birthDate is available, otherwise use existing age
  let displayAge = user.age;
  let displayBirthDate = "N/A";

  if (user.birthDate) {
    const birthDateObj = new Date(user.birthDate);
    const today = new Date();
    const ageDiffMs = today.getTime() - birthDateObj.getTime();
    const ageDate = new Date(ageDiffMs);
    displayAge = Math.abs(ageDate.getUTCFullYear() - 1970);
    displayBirthDate = new Date(user.birthDate).toLocaleDateString();
  }

  return `
        <div class="bg-gray-800/60 p-5 rounded-xl shadow-lg border border-purple-500/30 backdrop-blur-sm 
                    transform transition-all duration-300 hover:scale-105 hover:border-purple-400 hover:shadow-purple-400/20">
            <h3 class="text-xl font-bold text-purple-300">${user.firstName} ${user.lastName}</h3>
            <p class="text-gray-400 text-sm">${user.email}</p>
            <div class="mt-4 border-t border-gray-700 pt-3">
                <p class="text-gray-300"><span class="font-semibold text-teal-300">Age:</span> ${displayAge}</p>
                <p class="text-gray-300"><span class="font-semibold text-teal-300">Birth Date:</span> ${displayBirthDate}</p>
                <p class="text-gray-300"><span class="font-semibold text-teal-300">Gender:</span> ${user.gender}</p>
                <p class="text-gray-300"><span class="font-semibold text-teal-300">Contact:</span> ${user.phone}</p>
            </div>
        </div>
    `;
};

const renderUserList = () => {
  const usersListHtml = users.map((user) => renderUserCard(user)).join("");
  document.getElementById("user-container").innerHTML = usersListHtml;
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await axios.get("https://dummyjson.com/users");
    users = response.data.users;
    renderUserList();
  } catch (error) {
    console.log(error);
  }
});

async function getUser() {
  try {
    const response = await axios.get("https://dummyjson.com/users/1");
    const user = response.data;
    document.getElementById("get-user").innerHTML = renderUserCard(user);
  } catch (error) {
    console.error(error);
  }
}

async function addUser() {
  try {
    const birthDateStr = document.getElementById("birthDate").value;

    // Basic validation for birthDate
    if (!birthDateStr) {
      alert("Please enter a Birth Date.");
      return;
    }

    const birthDateObj = new Date(birthDateStr);
    const today = new Date();
    const ageDiffMs = today.getTime() - birthDateObj.getTime();
    const ageDate = new Date(ageDiffMs);
    const calculatedAge = Math.abs(ageDate.getUTCFullYear()); // Calculate age

    const newUserPayload = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      birthDate: birthDateStr, // Send birthDate
      age: calculatedAge, // Send calculated age
      gender: document.getElementById("gender").value,
      phone: document.getElementById("phone").value,
    };

    // Basic validation for other fields
    if (
      !newUserPayload.firstName ||
      !newUserPayload.lastName ||
      !newUserPayload.email
    ) {
      alert("Please fill in at least First Name, Last Name, and Email.");
      return;
    }

    const response = await axios.post(
      "https://dummyjson.com/users/add",
      newUserPayload
    );

    const newUser = response.data;
    // The dummyjson API might not return the birthDate, so we add it back if missing
    if (!newUser.birthDate) {
      newUser.birthDate = newUserPayload.birthDate;
    }
    // And ensure age is correct if it was modified by the API
    newUser.age = calculatedAge;

    // Add to the top of the local users array
    users.unshift(newUser);

    // Re-render the main user list
    renderUserList();

    // Display a notification with the new user's card
    const notificationEl = document.getElementById("new-user-notification");
    notificationEl.innerHTML = `
        <div class="bg-green-800/50 p-4 rounded-xl shadow-lg border border-green-500/30 backdrop-blur-sm">
            <h3 class="text-lg font-bold text-green-300">Successfully Created User:</h3>
            ${renderUserCard(newUser)}
        </div>
    `;

    // Clear the form
    document.getElementById("addUserForm").reset();

    // Optional: Hide notification after a few seconds
    setTimeout(() => {
      notificationEl.innerHTML = "";
    }, 5000);
  } catch (error) {
    console.log(error);
    alert("Failed to add user. Please check the console for details.");
  }
}

async function updateUser() {
  try {
    const response = await axios.put("https://dummyjson.com/users/1", {
      age: 99,
    });

    const updatedUser = response.data;
    const index = users.findIndex((user) => user.id === updatedUser.id);

    if (index !== -1) {
      users[index] = updatedUser;
    } else {
      // Find by name if id is not reliable from the dummy API
      const findByNameIndex = users.findIndex(
        (u) => u.firstName === "Terry" && u.lastName === "Medhurst"
      );
      if (findByNameIndex !== -1) users[findByNameIndex] = updatedUser;
    }

    renderUserList();
  } catch (error) {
    console.log(error);
  }
}
