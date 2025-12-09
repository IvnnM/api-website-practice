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
        <div class="user-card group relative bg-gray-800/60 p-5 rounded-xl shadow-lg border border-purple-500/30 backdrop-blur-sm
                    transform transition-all duration-300 hover:scale-105 hover:border-purple-400 hover:shadow-purple-400/20">

            <button
                class="more-options-btn absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none p-1 rounded-full z-20"
                onclick="toggleUserCardActions(event, ${user.id})"
            >
                <i class="fas fa-ellipsis-h"></i>
            </button>

            <div id="user-actions-${user.id}" class="user-card-actions absolute top-10 right-2 w-36 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-10 hidden">
                <button class="block w-full text-left px-4 py-2 text-sm text-purple-300 hover:bg-gray-700 hover:text-white transition-colors duration-200" onclick="editUser(${user.id})">
                    <i class="fas fa-pencil-alt mr-2"></i>Edit
                </button>
                <button class="block w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-gray-700 hover:text-white transition-colors duration-200" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash-alt mr-2"></i>Delete
                </button>
            </div>

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

// Function to toggle user card actions visibility
function toggleUserCardActions(event, userId) {
    event.stopPropagation(); // Prevent card click event if any

    const targetActions = document.getElementById(`user-actions-${userId}`);

    // Close all other open action menus
    document.querySelectorAll('.user-card-actions').forEach(actionsMenu => {
        if (actionsMenu.id !== `user-actions-${userId}` && !actionsMenu.classList.contains('hidden')) {
            actionsMenu.classList.add('hidden');
        }
    });

    // Toggle the target actions menu
    targetActions.classList.toggle('hidden');
}

// Close action menus when clicking anywhere else on the document
document.addEventListener('click', (event) => {
    if (!event.target.closest('.user-card-actions') && !event.target.closest('.more-options-btn')) {
        document.querySelectorAll('.user-card-actions').forEach(actionsMenu => {
            actionsMenu.classList.add('hidden');
        });
    }
});
const renderUserList = (usersToRender = users) => {
  const usersListHtml = usersToRender
    .map((user) => renderUserCard(user))
    .join("");
  document.getElementById("user-container").innerHTML = usersListHtml;
};

const updateList = () => {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  const sortBy = document.getElementById("sort-select").value;

  let filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm)
  );

  let sortedUsers = [...filteredUsers];

  switch (sortBy) {
    case "name-asc":
      sortedUsers.sort((a, b) => a.firstName.localeCompare(b.firstName));
      break;
    case "name-desc":
      sortedUsers.sort((a, b) => b.firstName.localeCompare(a.firstName));
      break;
    case "email-asc":
      sortedUsers.sort((a, b) => a.email.localeCompare(b.email));
      break;
    case "email-desc":
      sortedUsers.sort((a, b) => b.email.localeCompare(a.email));
      break;
    case "age-asc":
      sortedUsers.sort((a, b) => a.age - b.age);
      break;
    case "age-desc":
      sortedUsers.sort((a, b) => b.age - a.age);
      break;
  }

  renderUserList(sortedUsers);
};

document.addEventListener("DOMContentLoaded", async () => {
  const loadingSpinner = document.getElementById("loading-spinner");
  const userControls = document.getElementById("user-controls");

  try {
    const response = await axios.get("https://dummyjson.com/users");
    users = response.data.users;
    updateList();

    // Hide spinner and show controls
    loadingSpinner.classList.add("hidden");
    userControls.classList.remove("hidden");

    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("keyup", updateList);

    const sortSelect = document.getElementById("sort-select");
    sortSelect.addEventListener("change", updateList);
  } catch (error) {
    console.log(error);
    // Hide spinner even on error
    loadingSpinner.classList.add("hidden");
  }
});

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
    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970); // Calculate age

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
    updateList();

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

async function updateUser(userId) {
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
    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970); // Calculate age

    const updatedPayload = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      birthDate: birthDateStr,
      age: calculatedAge,
      gender: document.getElementById("gender").value,
      phone: document.getElementById("phone").value,
    };

    const response = await axios.put(
      `https://dummyjson.com/users/${userId}`,
      updatedPayload
    );

    const updatedUser = response.data;
    const index = users.findIndex((user) => user.id === userId);

    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
    }

    updateList();

    // Reset form and button
    document.getElementById("addUserForm").reset();
    const button = document.getElementById("form-button");
    button.innerText = "Create User";
    button.setAttribute("onclick", "addUser()");
    button.classList.remove("bg-blue-600", "hover:bg-blue-500");
    button.classList.add("bg-purple-600", "hover:bg-purple-500");
  } catch (error) {
    console.log(error);
    alert("Failed to update user. Please check the console for details.");
  }
}

function editUser(userId) {
  const user = users.find((u) => u.id === userId);
  if (user) {
    // Scroll to the form
    document.getElementById('addUserForm').scrollIntoView({ behavior: 'smooth' });

    document.getElementById("firstName").value = user.firstName;
    document.getElementById("lastName").value = user.lastName;
    document.getElementById("email").value = user.email;
    document.getElementById("birthDate").value = user.birthDate
      ? new Date(user.birthDate).toISOString().split("T")[0]
      : "";
    document.getElementById("gender").value = user.gender;
    document.getElementById("phone").value = user.phone;

    const button = document.getElementById("form-button");
    button.innerText = "Update User";
    button.setAttribute("onclick", `updateUser(${userId})`);
    button.classList.remove("bg-purple-600", "hover:bg-purple-500");
    button.classList.add("bg-blue-600", "hover:bg-blue-500");
  }
}

async function deleteUser(userId) {
  const user = users.find((u) => u.id === userId);
  if (
    user &&
    confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
    )
  ) {
    try {
      const response = await axios.delete(
        `https://dummyjson.com/users/${userId}`
      );
      if (response.status === 200) {
        const index = users.findIndex((user) => user.id === userId);
        if (index !== -1) {
          users.splice(index, 1);
          updateList();
        }
      }
    } catch (error) {
      console.log(error);
      alert("Failed to delete user. Please check the console for details.");
    }
  }
}

function resetForm() {
  document.getElementById("addUserForm").reset();
  const button = document.getElementById("form-button");
  button.innerText = "Create User";
  button.setAttribute("onclick", "addUser()");
  button.classList.remove("bg-blue-600", "hover:bg-blue-500");
  button.classList.add("bg-purple-600", "hover:bg-purple-500");
}
